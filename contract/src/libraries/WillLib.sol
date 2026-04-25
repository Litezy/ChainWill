// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library WillLib {
    struct Beneficiary {
        uint256 id;
        address wallet;
        uint256 percent;
        bool claimed;
        uint256 claimedAt;
    }

    struct WillStorage {
        // core
        address owner;
        address token;
        address pendingRecoveryWallet;
        bool locked;
        bool triggered;
        uint256 lastCheckIn;
        uint256 inactivityPeriod;
        uint256 gracePeriod;
        uint256 triggeredAt;
        uint256 finalPool;
        uint256 totalDeposited;
        address public platformAddress
        uint256 PLATFORM_FEE_BP = 50;

        // percent
        uint256 totalPercentAllocated;

        // reentrancy
        bool lockedReentrancy;

        // signers
        address[] signers;
        mapping(address => bool) isSigner;
        mapping(address => bool) hasSigned;
        uint256 signatureCount;
        uint256 requiredSignatures;

        // beneficiaries
        Beneficiary[] beneficiaries;
        uint256 beneficiaryIdCounter;
        mapping(uint256 => uint256) idToIndex;
    }

    uint256 constant MAX_PERCENT = 10_000;

    function attestationStartAt(WillStorage storage s) internal view returns (uint256) {
        return s.lastCheckIn + s.inactivityPeriod;
    }

    function claimTriggerAt(WillStorage storage s) internal view returns (uint256) {
        return attestationStartAt(s) + s.gracePeriod;
    }

    function isReadyToTrigger(WillStorage storage s) internal view returns (bool) {
        return block.timestamp >= claimTriggerAt(s);
    }
}