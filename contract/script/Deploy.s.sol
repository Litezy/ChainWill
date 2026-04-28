// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/factory/ChainWillFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ChainWillFactory factory = new ChainWillFactory(0x50128894772E46b80938f6A19279dC0da87F3236);

        console.log("ChainWillFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}

