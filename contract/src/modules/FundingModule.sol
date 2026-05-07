// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/WillBase.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";

/// @title FundingModule
/// @notice Handles owner check-in and config.
/// @dev In the new flow, tokens are NEVER deposited into this contract.
///      The owner simply approves this contract to spend their tokens.
///      At trigger time, TriggerModule pulls the approved amount via transferFrom.
///      This module no longer has deposit() or withdraw() functions.
abstract contract FundingModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;

    // ─────────────────────────────────────────────────────────────────────
    // CHECK-IN
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner calls this regularly to prove they are alive.
    ///         Resets the inactivity clock.
    ///         If owner stops calling this for inactivityPeriod + gracePeriod,
    ///         signers can trigger the will.
    function checkIn() external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Will is locked");

        s.lastCheckIn = block.timestamp;
        emit CheckIn(msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────────────
    // CONFIG
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner sets how long after the inactivity deadline before
    ///         the time-based trigger can fire.
    /// @param newGracePeriod duration in seconds (e.g. 7 days = 604800)
    function setGracePeriod(uint256 newGracePeriod) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Will is locked");
        require(newGracePeriod > 0, "Grace period must be > 0");

        uint256 old = s.gracePeriod;
        s.gracePeriod = newGracePeriod;
        emit GracePeriodUpdated(old, newGracePeriod);
    }

    /// @notice Owner sets how long of inactivity before attestation window opens.
    /// @param newPeriod duration in seconds (e.g. 365 days = 31536000)
    function setInactivityPeriod(uint256 newPeriod) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Will is locked");
        require(newPeriod > 0, "Inactivity period must be > 0");

        uint256 old = s.inactivityPeriod;
        s.inactivityPeriod = newPeriod;
        emit InactivityPeriodUpdated(old, newPeriod);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns how much the owner has currently approved this contract to pull.
    ///         This is what will be pulled at trigger time (minus fee).
    ///         Owner can call token.approve(willAddress, newAmount) at any time
    ///         to increase or update their approved amount.
    function getApprovedAmount() external view returns (uint256) {
        return IERC20(s.token).allowance(s.owner, address(this));
    }

    /// @notice Returns the owner's actual token balance in their wallet.
    ///         At trigger time, contract pulls min(approvedAmount, ownerBalance).
    function getOwnerBalance() external view returns (uint256) {
        return IERC20(s.token).balanceOf(s.owner);
    }

    /// @notice Returns the effective amount that will be pulled at trigger.
    ///         = min(approvedAmount, ownerWalletBalance)
    ///         This is what beneficiaries will split (before fee deduction).
    function getEffectivePullAmount() external view returns (uint256) {
        uint256 allowance    = IERC20(s.token).allowance(s.owner, address(this));
        uint256 ownerBalance = IERC20(s.token).balanceOf(s.owner);
        return allowance < ownerBalance ? allowance : ownerBalance;
    }

    /// @notice Full will status in one call — useful for frontend dashboard.
    function getWillStatus() external view returns (
        uint256 approvedAmount,
        uint256 ownerWalletBalance,
        uint256 effectivePullAmount,  // what will actually be pulled
        uint256 timeRemaining,        // seconds until trigger (0 if past)
        uint256 attestationOpensAt,   // timestamp signers can start attesting
        uint256 triggerUnlocksAt,     // timestamp time-trigger becomes available
        bool    triggered,
        bool    locked,
        uint256 inactivityPeriod,
        uint256 lastCheckIn,       
        uint256 gracePeriod,            
        uint256 finalPool             // set after trigger, 0 before
    ) {
        uint256 allowance = IERC20(s.token).allowance(s.owner, address(this));
        uint256 ownerBal  = IERC20(s.token).balanceOf(s.owner);
        uint256 triggerTime = s.claimTriggerAt();

        return (
            allowance,
            ownerBal,
            allowance < ownerBal ? allowance : ownerBal,
            block.timestamp >= triggerTime ? 0 : triggerTime - block.timestamp,
            s.attestationStartAt(),
            triggerTime,
            s.triggered,
            s.locked,
            s.inactivityPeriod,
            s.lastCheckIn,
            s.gracePeriod,
            s.finalPool
        );
    }
}