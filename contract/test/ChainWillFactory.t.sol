// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "./mocks/MockERC20.sol";

contract ChainWillFactoryTest is Test {
    ChainWillFactory factory;
    MockERC20 token;

    address owner   = makeAddr("owner");
    address signer1 = makeAddr("signer1");
    address signer2 = makeAddr("signer2");
    address platform = makeAddr("platform");

    function setUp() public {
        factory = new ChainWillFactory(platform);
        token   = new MockERC20();
    }

    function test_createWill() public {
        vm.startPrank(owner);
        address[] memory signers = new address[](2);
        signers[0] = signer1;
        signers[1] = signer2;

        address will = factory.createWill(address(token), signers, 365 days);
        vm.stopPrank();

        assertTrue(factory.isWill(will));
        assertEq(factory.totalWills(), 1);
        assertEq(factory.getWillsByOwner(owner)[0], will);
    }

    function test_createMultipleWills() public {
        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.startPrank(owner);
        factory.createWill(address(token), signers, 365 days);
        factory.createWill(address(token), signers, 180 days);
        vm.stopPrank();

        assertEq(factory.getWillsByOwner(owner).length, 2);
        assertEq(factory.totalWills(), 2);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_invalidToken() public {
    address[] memory signers = new address[](1);
    signers[0] = signer1;

    vm.expectRevert("Invalid token address"); // ✅ matches contract
    factory.createWill(address(0), signers, 365 days);
}

function test_revert_noSigners() public {
    address[] memory signers = new address[](0);

    vm.expectRevert("At least one signer required"); // ✅ matches contract
    factory.createWill(address(token), signers, 365 days);
}

function test_revert_invalidPeriod() public {
    address[] memory signers = new address[](1);
    signers[0] = signer1;

    vm.expectRevert("Inactivity period must be > 0"); // ✅ matches contract
    factory.createWill(address(token), signers, 0);
}
}