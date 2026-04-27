// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/factory/ChainWillFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ChainWillFactory factory = new ChainWillFactory(0x431EB1Cc0A50Df9239ee2b0cf375434bf3ba6D41);

        console.log("ChainWillFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}

