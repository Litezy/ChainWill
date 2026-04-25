// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../modules/FundingModule.sol";
import "../modules/BeneficiaryModule.sol";
import "../modules/SignerModule.sol";
import "../modules/TriggerModule.sol";
import "../interfaces/IERC20.sol";

contract ChainWill is
    FundingModule,
    BeneficiaryModule,
    SignerModule,
    TriggerModule
{
    constructor(
        address[] memory _signers,
        uint256 _inactivityPeriod,
        address _owner
        address _platform
    ) {
        require(_token != address(0), "Invalid token");
        require(_inactivityPeriod > 0, "Invalid inactivity");
        require(_signers.length > 0, "No signers");
        require(_owner != address(0), "Invalid owner");

        s.owner = _owner;
        s.token = IERC20(0x731ddCd5366146614ceDde3ec26EC57CEf3Ee8e0);
        s.inactivityPeriod = _inactivityPeriod;
        s.gracePeriod = 7 days;
        s.lastCheckIn = block.timestamp;
        s.platformAddress = _platform;

        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "Invalid signer");
            require(!s.isSigner[signer], "Duplicate signer");
            require(signer != _owner, "Owner cannot be signer");

            s.signers.push(signer);
            s.isSigner[signer] = true;
        }

        s.requiredSignatures = _signers.length == 1 ? 1 : 2;
    }

    // ✅ resolve _trigger conflict between SignerModule and TriggerModule
    function _trigger() internal override(SignerModule, TriggerModule) {
        TriggerModule._trigger();
    }

    // =========================
    // WALLET RECOVERY
    // =========================

    function requestWalletChange(address newWallet) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(newWallet != address(0), "Invalid wallet");
        require(newWallet != s.owner, "Same owner");

        s.pendingRecoveryWallet = newWallet;
        emit RecoveryRequested(newWallet);
    }

    function confirmWalletChange() external {
        require(!s.locked, "Locked");
        require(msg.sender == s.pendingRecoveryWallet, "Not pending wallet");

        address old = s.owner;
        s.owner = s.pendingRecoveryWallet;
        s.pendingRecoveryWallet = address(0);

        emit WalletRecovered(old, s.owner);
    }

    // =========================
    // VIEWS
    // =========================

    function getOwner() external view returns (address) {
        return s.owner;
    }

    function getToken() external view returns (address) {
        return s.token;
    }

    function isLocked() external view returns (bool) {
        return s.locked;
    }

    function getFinalPool() external view returns (uint256) {
        return s.finalPool;
    }
}