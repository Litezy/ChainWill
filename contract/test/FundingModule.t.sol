// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract FundingModuleTest is Test {
    ChainWillFactory factory;
    ChainWill        will;
    MockERC20        token;

    address owner    = makeAddr("owner");
    address signer1  = makeAddr("signer1");
    address platform = makeAddr("platform");
    address stranger = makeAddr("stranger");

    function setUp() public {
        factory = new ChainWillFactory(platform);
        token   = new MockERC20();

        // mint tokens to owner — they stay in owner's wallet
        token.mint(owner, 1000e18);

        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address willAddr = factory.createWill(address(token), signers, 365 days);
        will = ChainWill(willAddr);
    }

    // ── checkIn ──────────────────────────────────────────────────────────

    function test_checkIn() public {
        vm.warp(block.timestamp + 10 days);
        vm.prank(owner);
        will.checkIn();
    }

    function test_revert_checkIn_notOwner() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.checkIn();
    }

    // ── approval-based flow ───────────────────────────────────────────────

    function test_getApprovedAmount_zero_initially() public view {
        // owner hasn't approved anything yet
        assertEq(will.getApprovedAmount(), 0);
    }

    function test_getApprovedAmount_after_approval() public {
        vm.prank(owner);
        token.approve(address(will), 500e18);
        assertEq(will.getApprovedAmount(), 500e18);
    }

    function test_getOwnerBalance() public view {
        assertEq(will.getOwnerBalance(), 1000e18);
    }

    function test_getEffectivePullAmount_approval_less_than_balance() public {
        // approved 500 but has 1000 — effective = 500
        vm.prank(owner);
        token.approve(address(will), 500e18);
        assertEq(will.getEffectivePullAmount(), 500e18);
    }

    function test_getEffectivePullAmount_balance_less_than_approval() public {
        // approved 2000 but only has 1000 — effective = 1000
        vm.prank(owner);
        token.approve(address(will), 2000e18);
        assertEq(will.getEffectivePullAmount(), 1000e18);
    }

    function test_owner_can_increase_approval_anytime() public {
        vm.startPrank(owner);
        token.approve(address(will), 500e18);
        assertEq(will.getApprovedAmount(), 500e18);

        // owner gets more money and increases approval
        token.approve(address(will), 900e18);
        assertEq(will.getApprovedAmount(), 900e18);
        vm.stopPrank();
    }

    function test_getWillStatus() public {
        vm.prank(owner);
        token.approve(address(will), 500e18);

        (
            uint256 approved,
            uint256 ownerBal,
            uint256 effective,
            uint256 timeRemaining,
            ,
            ,
            bool triggered,
            bool locked,
            uint256 finalPool
        ) = will.getWillStatus();

        assertEq(approved,     500e18);
        assertEq(ownerBal,     1000e18);
        assertEq(effective,    500e18);
        assertTrue(timeRemaining > 0);
        assertFalse(triggered);
        assertFalse(locked);
        assertEq(finalPool, 0);
    }

    // ── config ────────────────────────────────────────────────────────────

    function test_setGracePeriod() public {
        vm.prank(owner);
        will.setGracePeriod(14 days);
    }

    function test_setInactivityPeriod() public {
        vm.prank(owner);
        will.setInactivityPeriod(180 days);
    }

    function test_revert_setGracePeriod_notOwner() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.setGracePeriod(14 days);
    }

    function test_revert_setGracePeriod_zero() public {
        vm.prank(owner);
        vm.expectRevert("Grace period must be > 0");
        will.setGracePeriod(0);
    }

    function test_revert_setInactivityPeriod_notOwner() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.setInactivityPeriod(180 days);
    }
}