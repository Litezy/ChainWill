// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";

/// @notice Base contract — holds the single shared storage instance
/// All modules inherit this so they all read/write the same `s`
abstract contract WillBase {
    WillLib.WillStorage internal s;
    modifier onlyOwner() {
        require(msg.sender == s.owner, "Not owner");
        _;
    }
}