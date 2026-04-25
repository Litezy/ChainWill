// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";
import "../interfaces/IEvents.sol";
import "../interfaces/IERC20.sol";
import "../base/WillBase.sol";

abstract contract FundingModule is WillBase,IEvents {
    using WillLib for WillLib.WillStorage;

    function deposit(uint256 amount) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(amount > 0, "Invalid amount");

        require(
            IERC20(s.token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        s.totalDeposited += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(amount > 0, "Invalid amount");
        require(s.totalDeposited >= amount, "Insufficient funds");

        s.totalDeposited -= amount;

        require(IERC20(s.token).transfer(s.owner, amount), "Transfer failed");
        emit Withdrawn(s.owner, amount);
    }

    function checkIn() external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");

        s.lastCheckIn = block.timestamp;
        emit CheckIn(msg.sender, block.timestamp);
    }

    function setGracePeriod(uint256 newGracePeriod) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(newGracePeriod > 0, "Invalid grace");

        uint256 old = s.gracePeriod;
        s.gracePeriod = newGracePeriod;
        emit GracePeriodUpdated(old, newGracePeriod);
    }

    function setInactivityPeriod(uint256 newPeriod) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(newPeriod > 0, "Invalid period");

        uint256 old = s.inactivityPeriod;
        s.inactivityPeriod = newPeriod;
        emit InactivityPeriodUpdated(old, newPeriod);
    }

    function getTotalDeposited() external view returns (uint256) {
        return s.totalDeposited;
    }
}