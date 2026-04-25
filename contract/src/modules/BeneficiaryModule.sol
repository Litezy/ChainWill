// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";
import "../base/WillBase.sol";

abstract contract BeneficiaryModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;


    function addBeneficiary(address wallet, uint256 percent) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(wallet != address(0), "Invalid wallet");
        require(percent > 0, "Invalid percent");
        require(
            s.totalPercentAllocated + percent <= WillLib.MAX_PERCENT,
            "Exceeds 100%"
        );

        for (uint256 i = 0; i < s.beneficiaries.length; i++) {
            require(s.beneficiaries[i].wallet != wallet, "Duplicate");
        }

        uint256 newId = ++s.beneficiaryIdCounter;
        s.idToIndex[newId] = s.beneficiaries.length;

        s.beneficiaries.push(
            WillLib.Beneficiary({
                id: newId,
                wallet: wallet,
                percent: percent,
                claimed: false,
                claimedAt: 0
            })
        );

        s.totalPercentAllocated += percent;
        emit BeneficiaryAdded(newId, wallet, percent);
    }

    function removeBeneficiary(uint256 id) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");

        uint256 index = s.idToIndex[id];
        require(index < s.beneficiaries.length, "Invalid id");
        require(s.beneficiaries[index].id == id, "Id mismatch");

        s.totalPercentAllocated -= s.beneficiaries[index].percent;

        emit BeneficiaryRemoved(id, s.beneficiaries[index].wallet);

        uint256 lastIndex = s.beneficiaries.length - 1;
        if (index != lastIndex) {
            WillLib.Beneficiary storage last = s.beneficiaries[lastIndex];
            s.beneficiaries[index] = last;
            s.idToIndex[last.id] = index;
        }

        delete s.idToIndex[id];
        s.beneficiaries.pop();
    }

    function updateBeneficiary(uint256 id, uint256 newPercent) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(newPercent > 0, "Invalid percent");

        uint256 index = s.idToIndex[id];
        require(s.beneficiaries[index].id == id, "Invalid id");

        WillLib.Beneficiary storage b = s.beneficiaries[index];
        uint256 oldPercent = b.percent;

        uint256 newTotal = s.totalPercentAllocated - oldPercent + newPercent;
        require(newTotal <= WillLib.MAX_PERCENT, "Exceeds 100%");

        s.totalPercentAllocated = newTotal;
        b.percent = newPercent;

        emit BeneficiaryUpdated(id, b.wallet, oldPercent, newPercent);
    }

    function claim(uint256 id) external {
        require(!s.lockedReentrancy, "Reentrant");
        s.lockedReentrancy = true;

        require(s.triggered, "Not triggered");
        require(s.finalPool > 0, "No funds");

        uint256 index = s.idToIndex[id];
        WillLib.Beneficiary storage b = s.beneficiaries[index];

        require(b.id == id, "Invalid id");
        require(msg.sender == b.wallet, "Not beneficiary");
        require(!b.claimed, "Already claimed");

        uint256 share = (s.finalPool * b.percent) / WillLib.MAX_PERCENT;
        require(share > 0, "Zero share");

        b.claimed = true;
        b.claimedAt = block.timestamp;

        require(IERC20(s.token).transfer(b.wallet, share), "Transfer failed");

        emit BeneficiaryClaimed(id, b.wallet, share);

        s.lockedReentrancy = false;
    }

    function getBeneficiaries() external view returns (WillLib.Beneficiary[] memory) {
        return s.beneficiaries;
    }

    function beneficiaryCount() external view returns (uint256) {
        return s.beneficiaries.length;
    }

    function remainingPercent() external view returns (uint256) {
        return WillLib.MAX_PERCENT - s.totalPercentAllocated;
    }
}