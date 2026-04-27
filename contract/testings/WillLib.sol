// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library WillLib {

    // ─────────────────────────────────────────────
    // BENEFICIARY STRUCT
    // ─────────────────────────────────────────────
    struct Beneficiary {
        uint256 id;           // stable unique ID — never changes
        address wallet;       // beneficiary wallet address
        uint256 percent;      // share in basis points (10000 = 100%)
        bool    claimed;      // has this beneficiary claimed?
        uint256 claimedAt;    // timestamp of claim
    }

    // ─────────────────────────────────────────────
    // CENTRAL STORAGE STRUCT
    // all modules read/write from this single struct
    // ─────────────────────────────────────────────
    struct WillStorage {

        // ── CORE ──────────────────────────────────
        address owner;                  // will owner (the person whose assets this covers)
        address token;                  // ERC20 token this will is denominated in
        address pendingRecoveryWallet;  // new wallet pending confirmation in recovery flow
        bool    locked;                 // true after trigger — no more config changes
        bool    triggered;              // true after will has been executed

        // ── TIMING ────────────────────────────────
        uint256 lastCheckIn;            // last time owner proved they're alive
        uint256 inactivityPeriod;       // how long without checkIn before attestation opens
        uint256 gracePeriod;            // extra buffer after inactivity before time-trigger fires
        uint256 triggeredAt;            // timestamp when will was triggered

        // ── POOL ──────────────────────────────────
        // NOTE: tokens stay in owner's wallet until trigger
        // at trigger: contract pulls approved amount via transferFrom
        uint256 finalPool;              // locked amount after fee — what beneficiaries split

        // ── PLATFORM FEE ──────────────────────────
        uint256 PLATFORM_FEE_BP;        // fee in basis points (50 = 0.5%)
        address platformAddress;        // address that receives the fee

        // ── REENTRANCY GUARD ──────────────────────
        bool lockedReentrancy;          // prevents reentrancy on claim

        // ── MULTISIG SIGNERS ──────────────────────
        address[] signers;                          // list of signer addresses
        mapping(address => bool) isSigner;          // is this address a signer?
        mapping(address => bool) hasSigned;         // has this signer attested?
        uint256 signatureCount;                     // how many signers have attested
        uint256 requiredSignatures;                 // how many needed to trigger

        // ── BENEFICIARIES ─────────────────────────
        Beneficiary[] beneficiaries;                // array of all beneficiaries
        uint256 beneficiaryIdCounter;               // increments on each add — never resets
        mapping(uint256 => uint256) idToIndex;      // beneficiaryId => array index (O(1) lookup)
        mapping(uint256 => mapping(address => bool)) isBenefactor ; // confirms if an address is a valid benefactor

        // ── PERCENT TRACKING ──────────────────────
        uint256 totalPercentAllocated;              // running total of all percentages added
    }

    // ─────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────
    uint256 constant MAX_PERCENT = 10_000; // 100% in basis points

    // ─────────────────────────────────────────────
    // PURE VIEW HELPERS
    // called inside modules via WillLib.fn(s)
    // ─────────────────────────────────────────────

    /// @notice timestamp when signers can begin attesting inactivity
    function attestationStartAt(WillStorage storage s)
        internal view returns (uint256)
    {
        return s.lastCheckIn + s.inactivityPeriod;
    }

    /// @notice timestamp when triggerByTime becomes callable
    function claimTriggerAt(WillStorage storage s)
        internal view returns (uint256)
    {
        return attestationStartAt(s) + s.gracePeriod;
    }

    /// @notice returns true if enough time has passed for time-based trigger
    function isReadyToTrigger(WillStorage storage s)
        internal view returns (bool)
    {
        return block.timestamp >= claimTriggerAt(s);
    }
}