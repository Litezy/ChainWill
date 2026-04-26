// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract TriggerModuleTest is Test {
    ChainWillFactory factory;
    ChainWill will;
    MockERC20 token;

    address owner   = makeAddr("owner");
    address signer1 = makeAddr("signer1");

    function setUp() public {
        factory = new ChainWillFactory();
        token   = new MockERC20();
        token.mint(owner, 1000e18);

        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address willAddr = factory.createWill(address(token), signers, 365 days);
        will = ChainWill(willAddr);

        vm.prank(owner);
        token.approve(address(will), type(uint256).max);

        vm.prank(owner);
        will.deposit(100e18);

        vm.prank(owner);
        will.addBeneficiary(makeAddr("ben"), 10_000);
    }

    function test_triggerByTime() public {
    vm.warp(block.timestamp + 365 days + 7 days + 1);

    vm.prank(signer1);
    will.triggerByTime();

    assertTrue(will.isTriggered());
    assertTrue(will.isLocked());

    // ✅ finalPool = deposited - 0.5% fee
    uint256 deposited = 100e18;
    uint256 fee       = (deposited * 50) / 10_000;
    uint256 finalPool = deposited - fee;

    assertEq(will.getFinalPool(), finalPool); // 99.5e18
}

    function test_timeUntilTrigger() public view {
        uint256 time = will.timeUntilTrigger();
        assertTrue(time > 0);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_triggerTooEarly() public {
        vm.prank(signer1);
        vm.expectRevert("Too early");
        will.triggerByTime();
    }

    function test_revert_triggerTwice() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(signer1);
        will.triggerByTime();

        vm.prank(signer1);
        vm.expectRevert("Already triggered");
        will.triggerByTime();
    }

    function test_revert_triggerNoBeneficiaries() public {
        // deploy fresh will with no beneficiaries
        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address w2 = factory.createWill(address(token), signers, 365 days);
        ChainWill will2 = ChainWill(w2);

        vm.prank(owner);
        token.approve(address(will2), type(uint256).max);

        vm.prank(owner);
        will2.deposit(100e18);

        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(signer1);
        vm.expectRevert("No beneficiaries");
        will2.triggerByTime();
    }

    function test_revert_strangerTriggerByTime() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(makeAddr("stranger"));
        vm.expectRevert("Not signer");
        will.triggerByTime();
    }
}