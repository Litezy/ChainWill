// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../modules/FundingModule.sol";
import "../modules/BeneficiaryModule.sol";
import "../modules/SignerModule.sol";
import "../modules/TriggerModule.sol";

/// @title ChainWill
/// @notice Core will contract. Deployed per user via ChainWillFactory.
///
/// FLOW:
///   1. Owner registers → factory deploys this contract
///   2. Owner calls token.approve(thisContract, amount) — tokens stay in their wallet
///   3. Owner adds beneficiaries and sets up signers
///   4. Owner checks in regularly to prove they are alive
///   5. If owner stops checking in → signers attest → will triggers
///   6. Contract pulls approved tokens from owner's wallet via transferFrom
///   7. 0.5% platform fee deducted → remainder locked as finalPool
///   8. Beneficiaries call claim(id) to receive their share
///
contract ChainWill is
    FundingModule,
    BeneficiaryModule,
    SignerModule,
    TriggerModule
{
    // ─────────────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────

    /// @param _admin             admin address to call the triggerByTime function
    /// @param _signers           Array of trusted signer addresses
    /// @param _inactivityPeriod  Seconds of inactivity before attestation opens
    /// @param _owner             The will owner (set by factory to msg.sender)
    /// @param _platformAddress   Address that receives the 0.5% platform fee
    constructor(
        address _admin,
        address[] memory _signers,
        uint256   _inactivityPeriod,
        address   _owner,
        address   _platformAddress
    ) {
        // ── validate inputs ───────────────────────────────────────────
        require(_owner           != address(0), "Invalid owner address");
        require(_platformAddress != address(0), "Invalid platform address");
        require(_inactivityPeriod > 0,          "Inactivity period must be > 0");
        require(_signers.length  > 0,           "At least one signer required");
        require(_signers.length <= 3, "Maximum 3 signers allowed");

        // ── set core state ────────────────────────────────────────────
        s.admin = _admin;
        s.owner           = _owner;
        s.token           = address(0x9b068dC0418064C11d9bc563edC26890DD95a60e);
        s.platformAddress = _platformAddress;
        s.inactivityPeriod = _inactivityPeriod;
        s.gracePeriod     = 2 minutes;         // default 7 day grace period
        s.lastCheckIn     = block.timestamp; // owner starts with full period
        s.PLATFORM_FEE_BP = 50;             // 0.5% = 50 basis points

        // ── register signers ──────────────────────────────────────────
        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "Invalid signer address");
            require(!s.isSigner[signer],  "Duplicate signer address");
            require(signer != _owner,     "Owner cannot be a signer");

            s.signers.push(signer);
            s.isSigner[signer] = true;
        }

        // 1 signer → requires 1 signature
        // 2+ signers → requires 2 signatures
        s.requiredSignatures = _signers.length == 1 ? 1 : 2;
    }

    // ─────────────────────────────────────────────────────────────────────
    // RESOLVE _trigger CONFLICT
    // Both SignerModule and TriggerModule declare virtual _trigger()
    // ChainWill resolves by explicitly routing to TriggerModule._trigger()
    // ─────────────────────────────────────────────────────────────────────
    function _trigger()
        internal
        override(SignerModule, TriggerModule)
    {
        TriggerModule._trigger();
    }

    // ─────────────────────────────────────────────────────────────────────
    // WALLET RECOVERY
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Step 1 — Current owner initiates a wallet change request.
    ///         Sets pending wallet but does NOT transfer ownership yet.
    /// @param newWallet The new wallet address the owner wants to switch to
    function requestWalletChange(address newWallet) external {
        require(msg.sender == s.owner,   "Not owner");
        require(!s.locked,               "Will is locked");
        require(newWallet != address(0), "Invalid wallet address");
        require(newWallet != s.owner,    "New wallet is same as current");

        s.pendingRecoveryWallet = newWallet;
        emit RecoveryRequested(newWallet);
    }

    /// @notice Step 2 — The NEW wallet confirms the ownership transfer.
    ///         Must be called by the new wallet, not the old owner.
    ///         This two-step process prevents accidental or malicious transfers.
    function confirmWalletChange() external {
        require(!s.locked, "Will is locked");
        require(
            msg.sender == s.pendingRecoveryWallet,
            "Only the new wallet can confirm"
        );

        address oldOwner = s.owner;
        s.owner = s.pendingRecoveryWallet;
        s.pendingRecoveryWallet = address(0);

        emit WalletRecovered(oldOwner, s.owner);
    }

    // ─────────────────────────────────────────────────────────────────────
    // GENERAL VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns the will owner address.
    function getOwner() external view returns (address) {
        return s.owner;
    }

    /// @notice Returns the ERC20 token address this will covers.
    function getToken() external view returns (address) {
        return s.token;
    }

    /// @notice Returns the platform fee address.
    function getPlatformAddress() external view returns (address) {
        return s.platformAddress;
    }

    /// @notice Returns the platform fee in basis points (50 = 0.5%).
    function getPlatformFeeBP() external view returns (uint256) {
        return s.PLATFORM_FEE_BP;
    }

    /// @notice Returns the pending recovery wallet (address(0) if none).
    function getPendingRecoveryWallet() external view returns (address) {
        return s.pendingRecoveryWallet;
    }
}