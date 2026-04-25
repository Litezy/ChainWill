// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract BeneficiaryModuleTest is Test {
    ChainWillFactory factory;
    ChainWill will;
    MockERC20 token;

    address owner   = makeAddr("owner");
    address signer1 = makeAddr("signer1");
    address alice   = makeAddr("alice");
    address bob     = makeAddr("bob");
    address charlie = makeAddr("charlie");

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
    }

    function test_addBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        assertEq(will.beneficiaryCount(), 1);
        assertEq(will.remainingPercent(), 5000);
    }

    function test_addMultipleBeneficiaries() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        will.addBeneficiary(bob, 3000);

        vm.prank(owner);
        will.addBeneficiary(charlie, 2000);

        assertEq(will.beneficiaryCount(), 3);
        assertEq(will.remainingPercent(), 0);
    }

    function test_removeBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        will.addBeneficiary(bob, 5000);

        // remove alice (id=1)
        vm.prank(owner);
        will.removeBeneficiary(1);

        assertEq(will.beneficiaryCount(), 1);
        assertEq(will.remainingPercent(), 5000);
    }

    function test_updateBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        will.updateBeneficiary(1, 3000);

        assertEq(will.remainingPercent(), 7000);
    }

    function test_claim() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        // trigger
        vm.prank(signer1);
        will.triggerBySigners();

        uint256 balBefore = token.balanceOf(alice);

        vm.prank(alice);
        will.claim(1);

        assertEq(token.balanceOf(alice), balBefore + 100e18);
    }

    function test_claimPartialShares() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 6000);

        vm.prank(owner);
        will.addBeneficiary(bob, 4000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(alice);
        will.claim(1);

        vm.prank(bob);
        will.claim(2);

        assertEq(token.balanceOf(alice), 60e18);
        assertEq(token.balanceOf(bob),   40e18);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_duplicateBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        vm.expectRevert("Duplicate");
        will.addBeneficiary(alice, 3000);
    }

    function test_revert_exceedsMaxPercent() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 8000);

        vm.prank(owner);
        vm.expectRevert("Exceeds 100%");
        will.addBeneficiary(bob, 3000);
    }

    function test_revert_claimBeforeTrigger() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(alice);
        vm.expectRevert("Not triggered");
        will.claim(1);
    }

    function test_revert_claimTwice() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(alice);
        will.claim(1);

        vm.prank(alice);
        vm.expectRevert("Already claimed");
        will.claim(1);
    }

    function test_revert_wrongBeneficiaryClaims() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(bob);
        vm.expectRevert("Not beneficiary");
        will.claim(1);
    }

    function test_revert_addAfterLock() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(owner);
        vm.expectRevert("Locked");
        will.addBeneficiary(bob, 5000);
    }
}