// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEvents {

    // ── APPROVAL / FUNDING ────────────────────────────────────────────────
    /// @notice emitted when owner grants token approval to the contract
    event ApprovalGranted(address indexed owner, uint256 amount);

    // ── CHECK-IN ──────────────────────────────────────────────────────────
    /// @notice emitted when owner checks in to prove they are alive
    event CheckIn(address indexed owner, uint256 timestamp);

    // ── TRIGGER ───────────────────────────────────────────────────────────
    /// @notice emitted when the will is locked and funds are pulled
    event WillLocked(uint256 timestamp, uint256 finalPool, uint256 fee);

    /// @notice emitted when triggerByTime is called successfully
    event InactivityTriggered(
        address indexed triggeredBy,
        uint256 triggeredAt,
        uint256 attestationStart
    );

    // ── CONFIG ────────────────────────────────────────────────────────────
    event GracePeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event InactivityPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    // ── SIGNERS ───────────────────────────────────────────────────────────
    /// @notice emitted each time a signer attests
    event SignerAttested(
        address indexed signer,
        uint256 signatureCount,
        uint256 requiredSignatures
    );

    /// @notice emitted when a signer withdraws their attestation
    event AttestationRevoked(address indexed signer, uint256 signatureCount);

    /// @notice emitted when owner replaces a signer
    event SignerReplaced(address indexed oldSigner, address indexed newSigner);

    // ── BENEFICIARIES ─────────────────────────────────────────────────────
    event BeneficiaryAdded(
        uint256 indexed id,
        address indexed wallet,
        uint256 percent
    );
    event BeneficiaryUpdated(
        uint256 indexed id,
        address indexed wallet,
        uint256 oldPercent,
        uint256 newPercent
    );
    event BeneficiaryAddressUpdated(
        uint256 indexed id,
        address indexed oldWallet,
        address indexed newWallet
    );
    event BeneficiaryRemoved(uint256 indexed id, address indexed wallet);
    event BeneficiaryClaimed(
        uint256 indexed id,
        address indexed wallet,
        uint256 amount
    );

    // ── WALLET RECOVERY ───────────────────────────────────────────────────
    event RecoveryRequested(address indexed newWallet);
    event WalletRecovered(address indexed oldOwner, address indexed newOwner);

    // ── FACTORY ───────────────────────────────────────────────────────────
    event WillCreated(
        address indexed will,
        address indexed owner,
        address indexed token
    );
}