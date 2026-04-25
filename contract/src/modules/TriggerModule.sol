// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";
import "../base/WillBase.sol";

abstract contract TriggerModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;

    function triggerByTime() external {
        require(s.isSigner[msg.sender], "Not signer");
        require(!s.triggered, "Already triggered");
        require(s.isReadyToTrigger(), "Too early");
        require(s.beneficiaries.length > 0, "No beneficiaries");
        require(s.totalDeposited > 0, "No funds");

        _trigger();

        emit InactivityTriggered(
            msg.sender,
            s.triggeredAt,
            s.attestationStartAt(),
            s.claimTriggerAt()
        );
    }

    function _trigger() internal virtual {
        s.triggered = true;
        s.locked = true;
        //send 0.5% of the money to platform as fees
        // get the balance 
        uint256 currentBalance = s.totalDeposited;

        // Calculate 0.5% fee
        uint256 fee = (currentBalance * s.PLATFORM_FEE_BP) / 10_000;

        // Transfer fee to platform
        if (fee > 0 && s.platformAddress != address(0)) {
           require(
            IERC20(s.token).transfer(s.platformAddress, fee),
            "Fee transfer failed"
        );
        // reduce tracked balance
        s.totalDeposited -= fee;
        }
        s.finalPool = currentBalance - fee;
        s.triggeredAt = block.timestamp;
        emit WillLocked(block.timestamp);
    }

    function attestationStartAt() external view returns (uint256) {
        return s.attestationStartAt();
    }

    function claimTriggerAt() external view returns (uint256) {
        return s.claimTriggerAt();
    }

    function timeUntilTrigger() external view returns (uint256) {
        uint256 triggerTime = s.claimTriggerAt();
        if (block.timestamp >= triggerTime) return 0;
        return triggerTime - block.timestamp;
    }

    function isTriggered() external view returns (bool) {
        return s.triggered;
    }
}
