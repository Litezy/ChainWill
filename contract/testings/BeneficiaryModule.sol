// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/WillBase.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";

/// @title BeneficiaryModule
/// @notice Manages beneficiary registration and token claiming after trigger.
abstract contract BeneficiaryModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;
    
    modifier isAValidBenefactor(uint256 _id) {
        require(
            s.isBenefactor[_id][msg.sender],
            "Not a valid benefactor"
        );
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    // ADD
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner adds a beneficiary with a percentage share.
    /// @param wallet   Beneficiary's wallet address
    /// @param percent  Share in basis points (e.g. 5000 = 50%, 10000 = 100%)
    function addBeneficiary(address wallet, uint256 percent) external onlyOwner {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked,             "Will is locked");
        require(wallet != address(0),  "Invalid wallet address");
        require(percent > 0,           "Percent must be > 0");
        require(
            s.totalPercentAllocated + percent <= WillLib.MAX_PERCENT,
            "Total allocation exceeds 100%"
        );

        // prevent duplicate beneficiary wallet
        if(s.beneficiaryIdCounter > 0){
            for (uint256 i = 0; i < s.beneficiaries.length; i++) {
            require(
                s.beneficiaries[i].wallet != wallet,
                "Wallet already a beneficiary"
            );
        }
        }

        // assign stable ID — increments from 1, never resets
        uint256 newId = ++s.beneficiaryIdCounter;

        // store array position for O(1) lookup by ID
        s.idToIndex[newId] = s.beneficiaries.length;

        s.beneficiaries.push(WillLib.Beneficiary({
            id:        newId,
            wallet:    wallet,
            percent:   percent,
            claimed:   false,
            claimedAt: 0
        }));
        s.isBenefactor[newId][wallet]=true;
        s.totalPercentAllocated += percent;
        emit BeneficiaryAdded(newId, wallet, percent);
    }

    // ─────────────────────────────────────────────────────────────────────
    // REMOVE
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner removes a beneficiary by their stable ID.
    ///         Uses swap-and-pop — updates idToIndex for the moved item.
    /// @param id The stable beneficiary ID (NOT array index)
    function removeBeneficiary(uint256 id) external onlyOwner {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked,             "Will is locked");

        uint256 index = s.idToIndex[id];
        require(index < s.beneficiaries.length, "Invalid beneficiary ID");
        require(s.beneficiaries[index].id == id, "ID mismatch");

        // free up the percent allocation
        s.totalPercentAllocated -= s.beneficiaries[index].percent;

        emit BeneficiaryRemoved(id, s.beneficiaries[index].wallet);

        uint256 lastIndex = s.beneficiaries.length - 1;

        if (index != lastIndex) {
            // swap removed item with last item
            WillLib.Beneficiary storage last = s.beneficiaries[lastIndex];
            s.beneficiaries[index] = last;
            // update the moved item's index in the map
            s.idToIndex[last.id] = index;
        }

        // clean up removed item
        delete s.idToIndex[id];
        s.beneficiaries.pop();
    }

    // ─────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner updates a beneficiary's percentage share.
    /// @param id         Stable beneficiary ID
    /// @param newPercent New share in basis points
    function updateBeneficiaryPercentage(uint256 id, uint256 newPercent) external  onlyOwner {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked,             "Will is locked");
        require(newPercent > 0,        "Percent must be > 0");

        uint256 index = s.idToIndex[id];
        require(s.beneficiaries[index].id == id, "Invalid beneficiary ID");

        WillLib.Beneficiary storage b = s.beneficiaries[index];
        uint256 oldPercent = b.percent;

        uint256 newTotal = s.totalPercentAllocated - oldPercent + newPercent;
        require(newTotal <= WillLib.MAX_PERCENT, "Total allocation exceeds 100%");

        s.totalPercentAllocated = newTotal;
        b.percent = newPercent;

        emit BeneficiaryUpdated(id, b.wallet, oldPercent, newPercent);
    }



    /// @notice Owner updates a beneficiary's percentage share.
    /// @param id         Stable beneficiary ID
    /// @param _newWallet New share in basis points
    function updateBeneficiaryAddress(uint256 id, address _newWallet) external onlyOwner {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked,             "Will is locked");

        uint256 index = s.idToIndex[id];
        require(s.beneficiaries[index].id == id, "Invalid beneficiary ID");

        WillLib.Beneficiary storage b = s.beneficiaries[index];
        address oldWallet = b.wallet;
        b.wallet = _newWallet;

        emit BeneficiaryAddressUpdated(id, oldWallet,_newWallet);
    }

    // ─────────────────────────────────────────────────────────────────────
    // CLAIM
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Beneficiary calls this to claim their share after trigger.
    ///         Uses nonReentrant guard and CEI pattern.
    /// @param id The stable beneficiary ID assigned when they were added
    function claim(uint256 id) external isAValidBenefactor(id){
        // ── reentrancy guard ──────────────────────────────────────────
        require(!s.lockedReentrancy, "Reentrant call detected");
        s.lockedReentrancy = true;

        // ── checks ────────────────────────────────────────────────────
        require(s.triggered,     "Will has not been triggered yet");
        require(s.finalPool > 0, "No funds available to claim");

        uint256 index = s.idToIndex[id];
        WillLib.Beneficiary storage b = s.beneficiaries[index];

        require(b.id == id,              "Invalid beneficiary ID");
        require(msg.sender == b.wallet,  "Caller is not this beneficiary");
        require(!b.claimed,              "Already claimed");

        // ── calculate share ───────────────────────────────────────────
        // share = finalPool × (percent / 10000)
        uint256 share = (s.finalPool * b.percent) / WillLib.MAX_PERCENT;
        require(share > 0, "Calculated share is zero");

        // ── effects (state update BEFORE transfer) ────────────────────
        b.claimed   = true;
        b.claimedAt = block.timestamp;

        // ── interaction (transfer AFTER state update) ─────────────────
        require(
            IERC20(s.token).transfer(b.wallet, share),
            "Token transfer to beneficiary failed"
        );

        emit BeneficiaryClaimed(id, b.wallet, share);

        // release reentrancy guard
        s.lockedReentrancy = false;
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns full list of all beneficiaries and their details.
    function getBeneficiaries()
        external view
        returns (WillLib.Beneficiary[] memory)
    {
        return s.beneficiaries;
    }

   function getOneBeneficiary(uint256 _id)
    external view
    returns (WillLib.Beneficiary memory)
{
    uint256 index = s.idToIndex[_id];
    require(s.beneficiaries[index].id == _id, "Invalid beneficiary ID");
    return s.beneficiaries[index];
}

    /// @notice Returns count of registered beneficiaries.
    function beneficiaryCount() external view returns (uint256) {
        return s.beneficiaries.length;
    }

    /// @notice Returns how much percentage is still unallocated.
    ///         e.g. if 6000 allocated → returns 4000 (40% remaining)
    function remainingPercent() external view returns (uint256) {
        return WillLib.MAX_PERCENT - s.totalPercentAllocated;
    }
}