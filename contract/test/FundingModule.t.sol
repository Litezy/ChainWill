// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract FundingModuleTest is Test {
    ChainWillFactory factory;
    ChainWill will;
    MockERC20 token;

    address owner   = makeAddr("owner");
    address signer1 = makeAddr("signer1");
    address stranger = makeAddr("stranger");

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
    }

    function test_deposit() public {
        vm.prank(owner);
        will.deposit(100e18);

        assertEq(will.getTotalDeposited(), 100e18);
    }

    function test_withdraw() public {
        vm.prank(owner);
        will.deposit(100e18);

        vm.prank(owner);
        will.withdraw(50e18);

        assertEq(will.getTotalDeposited(), 50e18);
    }

    function test_checkIn() public {
        vm.warp(block.timestamp + 10 days);
        vm.prank(owner);
        will.checkIn();
    }

    function test_setGracePeriod() public {
        vm.prank(owner);
        will.setGracePeriod(14 days);
    }

    function test_setInactivityPeriod() public {
        vm.prank(owner);
        will.setInactivityPeriod(180 days);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_depositZero() public {
        vm.prank(owner);
        vm.expectRevert("Invalid amount");
        will.deposit(0);
    }

    function test_revert_withdrawMoreThanDeposited() public {
        vm.prank(owner);
        will.deposit(100e18);

        vm.prank(owner);
        vm.expectRevert("Insufficient funds");
        will.withdraw(200e18);
    }

    function test_revert_strangerDeposit() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.deposit(100e18);
    }

    function test_revert_strangerWithdraw() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.withdraw(100e18);
    }

    function test_revert_strangerCheckIn() public {
        vm.prank(stranger);
        vm.expectRevert("Not owner");
        will.checkIn();
    }

    function test_revert_depositWhenLocked() public {
        // setup and trigger
        vm.prank(owner);
        will.deposit(100e18);
        vm.prank(owner);
        will.addBeneficiary(makeAddr("ben"), 10_000);
        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(owner);
        vm.expectRevert("Locked");
        will.deposit(10e18);
    }
}