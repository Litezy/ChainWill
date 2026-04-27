// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ERC/ChainWillToken.sol";

contract DeployToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ChainWillToken token = new ChainWillToken();

        console.log("ChainWillToken deployed at:", address(token));

        vm.stopBroadcast();
    }
}