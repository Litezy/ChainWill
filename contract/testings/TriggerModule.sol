// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/WillBase.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";

/// @title TriggerModule
/// @notice Handles time-based trigger logic and the internal _trigger function.
/// @dev At trigger time this contract pulls tokens from the owner's wallet
///      using the pre-approved allowance. The owner never deposits — they
///      only approve. Tokens stay in their wallet until this moment.
abstract contract TriggerModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;

    // ─────────────────────────────────────────────────────────────────────
    // TIME-BASED TRIGGER
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Any signer can call this once the inactivity + grace period
    ///         has passed without the owner checking in.
    ///         Pulls approved funds from owner's wallet and locks the will.
    function triggerByTime() external {
        require(s.isSigner[msg.sender], "Not a signer");
        require(!s.triggered,           "Will already triggered");
        require(s.isReadyToTrigger(),   "Too early as inactivity period not elapsed");
        require(s.beneficiaries.length > 0, "No beneficiaries set");

        _trigger();

        emit InactivityTriggered(
            msg.sender,
            s.triggeredAt,
            s.attestationStartAt(),
            s.claimTriggerAt()
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // INTERNAL TRIGGER — called by triggerByTime and SignerModule
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Core trigger logic.
    ///         1. Marks will as triggered and locked
    ///         2. Pulls approved tokens from owner's wallet
    ///         3. Deducts 0.5% platform fee
    ///         4. Sets finalPool — the amount beneficiaries will split
    function _trigger() internal virtual {
        // ── STEP 1: lock the will ──────────────────────────────────────
        s.triggered  = true;
        s.locked     = true;
        s.triggeredAt = block.timestamp;

        // ── STEP 2: determine how much to pull ────────────────────────
        // We pull the MINIMUM of:
        //   a) what the owner approved us to spend
        //   b) what the owner actually has in their wallet
        // This prevents a revert if owner spent some funds since approval
        uint256 allowance    = IERC20(s.token).allowance(s.owner, address(this));
        uint256 ownerBalance = IERC20(s.token).balanceOf(s.owner);

        require(allowance > 0,    "Owner has not approved any funds");
        require(ownerBalance > 0, "Owner wallet has no balance");

        uint256 amountToPull = allowance < ownerBalance
                               ? allowance
                               : ownerBalance;

        require(amountToPull > 0, "Nothing to pull");

        // ── STEP 3: pull tokens from owner's wallet into this contract ─
        require(
            IERC20(s.token).transferFrom(s.owner, address(this), amountToPull),
            "Token pull from owner failed"
        );

        // ── STEP 4: calculate and send platform fee ────────────────────
        uint256 fee = (amountToPull * s.PLATFORM_FEE_BP) / 10_000;

        if (fee > 0 && s.platformAddress != address(0)) {
            require(
                IERC20(s.token).transfer(s.platformAddress, fee),
                "Platform fee transfer failed"
            );
        }

        // ── STEP 5: set finalPool — what beneficiaries will split ──────
        // finalPool = pulled amount minus platform fee
        s.finalPool = amountToPull - fee;

        emit WillLocked(block.timestamp, s.finalPool, fee);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Timestamp when the attestation window opens for signers.
    function attestationStartAt() external view returns (uint256) {
        return s.attestationStartAt();
    }

    /// @notice Timestamp when triggerByTime becomes callable.
    function claimTriggerAt() external view returns (uint256) {
        return s.claimTriggerAt();
    }

    /// @notice Seconds remaining until trigger is available. Returns 0 if past.
    function timeUntilTrigger() external view returns (uint256) {
        uint256 triggerTime = s.claimTriggerAt();
        if (block.timestamp >= triggerTime) return 0;
        return triggerTime - block.timestamp;
    }

    /// @notice Whether the will has been triggered.
    function isTriggered() external view returns (bool) {
        return s.triggered;
    }

    /// @notice Whether the will is locked (no more config changes allowed).
    function isLocked() external view returns (bool) {
        return s.locked;
    }

    /// @notice The final pool available for beneficiaries after fee deduction.
    ///         Returns 0 before trigger.
    function getFinalPool() external view returns (uint256) {
        return s.finalPool;
    }
}