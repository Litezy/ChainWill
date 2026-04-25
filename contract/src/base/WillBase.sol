// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";

abstract contract WillBase {
    // single storage declaration — all modules share this
    WillLib.WillStorage internal s;
}