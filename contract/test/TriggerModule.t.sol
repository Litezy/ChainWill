// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract TriggerModuleTest is Test {
    ChainWillFactory factory;
    ChainWill        will;
    MockERC20        token;

    address owner    = makeAddr("owner");
    address signer1  = makeAddr("signer1");
    address platform = makeAddr("platform");
    address ben      = makeAddr("ben");

    uint256 constant DEPOSIT = 100e18;

    function setUp() public {
        factory = new ChainWillFactory(platform);
        token   = new MockERC20();

        // tokens stay in owner's wallet
        token.mint(owner, DEPOSIT);

        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address willAddr = factory.createWill(address(token), signers, 365 days);
        will = ChainWill(willAddr);

        // owner approves the will to pull their tokens at trigger time
        vm.prank(owner);
        token.approve(address(will), DEPOSIT);

        // add a beneficiary
        vm.prank(owner);
        will.addBeneficiary(ben, 10_000);
    }

    function test_triggerByTime() public {
        // warp past inactivity period + grace period
        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(signer1);
        will.triggerByTime();

        // will is now triggered and locked
        assertTrue(will.isTriggered());
        assertTrue(will.isLocked());

        // tokens were pulled from owner's wallet into the contract
        assertEq(token.balanceOf(owner),        0);
        assertEq(token.balanceOf(address(will)), DEPOSIT - (DEPOSIT * 50 / 10_000));

        // finalPool = DEPOSIT - 0.5% fee
        uint256 fee       = (DEPOSIT * 50) / 10_000;
        uint256 finalPool = DEPOSIT - fee;
        assertEq(will.getFinalPool(), finalPool);

        // platform received the fee
        assertEq(token.balanceOf(platform), fee);
    }

    function test_triggerBySigners_pulls_funds() public {
        vm.prank(signer1);
        will.triggerBySigners();

        assertTrue(will.isTriggered());

        uint256 fee = (DEPOSIT * 50) / 10_000;
        assertEq(will.getFinalPool(), DEPOSIT - fee);
        assertEq(token.balanceOf(platform), fee);
        assertEq(token.balanceOf(owner), 0);
    }

    function test_timeUntilTrigger_decreases() public {
        uint256 t1 = will.timeUntilTrigger();
        vm.warp(block.timestamp + 30 days);
        uint256 t2 = will.timeUntilTrigger();
        assertTrue(t2 < t1);
    }

    function test_timeUntilTrigger_zero_after_deadline() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        assertEq(will.timeUntilTrigger(), 0);
    }

    function test_effective_pull_uses_minimum() public {
        // owner only has 60e18 but approved 100e18
        // effective pull should be 60e18
        token.mint(owner, 0); // already has 100e18 from setUp

        // burn some from owner by transferring out
        vm.prank(owner);
        token.transfer(makeAddr("someone"), 40e18);

        // owner now has 60e18, approved 100e18
        assertEq(will.getApprovedAmount(),     100e18);
        assertEq(will.getOwnerBalance(),       60e18);
        assertEq(will.getEffectivePullAmount(), 60e18);

        vm.warp(block.timestamp + 365 days + 7 days + 1);
        vm.prank(signer1);
        will.triggerByTime();

        // only 60e18 was pulled
        uint256 fee = (60e18 * 50) / 10_000;
        assertEq(will.getFinalPool(), 60e18 - fee);
    }

    // ── negative ──────────────────────────────────────────────────────────

    function test_revert_triggerTooEarly() public {
        vm.prank(signer1);
        vm.expectRevert("Too early as inactivity period not elapsed");
        will.triggerByTime();
    }

    function test_revert_triggerTwice() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        vm.prank(signer1);
        will.triggerByTime();

        vm.prank(signer1);
        vm.expectRevert("Will already triggered");
        will.triggerByTime();
    }

    function test_revert_trigger_noApproval() public {
        // revoke approval
        vm.prank(owner);
        token.approve(address(will), 0);

        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(signer1);
        vm.expectRevert("Owner has not approved any funds");
        will.triggerByTime();
    }

    function test_revert_trigger_noBeneficiaries() public {
        // deploy fresh will with no beneficiaries
        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address w2 = factory.createWill(address(token), signers, 365 days);
        ChainWill will2 = ChainWill(w2);

        vm.prank(owner);
        token.approve(address(will2), DEPOSIT);

        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.prank(signer1);
        vm.expectRevert("No beneficiaries set");
        will2.triggerByTime();
    }

    function test_revert_strangerTrigger() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        vm.prank(makeAddr("stranger"));
        vm.expectRevert("Not a signer");
        will.triggerByTime();
    }
}