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

    address owner = makeAddr("owner");
    address signer1 = makeAddr("signer1");
    address platform = makeAddr("platform");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");

    uint256 constant DEPOSIT = 100e18;
    uint256 fee;
    uint256 finalPool;

    function setUp() public {
        factory = new ChainWillFactory(platform);
        token = new MockERC20();
        token.mint(owner, DEPOSIT);

        address[] memory signers = new address[](1);
        signers[0] = signer1;

        vm.prank(owner);
        address willAddr = factory.createWill(
            signers
        );
        will = ChainWill(willAddr);

        // owner approves — tokens stay in wallet until trigger
        vm.prank(owner);
        token.approve(address(will), DEPOSIT);

        fee = (DEPOSIT * 50) / 10_000;
        finalPool = DEPOSIT - fee;
    }

    // ── add ───────────────────────────────────────────────────────────────

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

    // ── remove ────────────────────────────────────────────────────────────

    function test_removeBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);
        vm.prank(owner);
        will.addBeneficiary(bob, 5000);

        vm.prank(owner);
        will.removeBeneficiary(1); // remove alice

        assertEq(will.beneficiaryCount(), 1);
        assertEq(will.remainingPercent(), 5000);
    }

    // ── update ────────────────────────────────────────────────────────────

    function test_updateBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        will.updateBeneficiaryPercentage(1, 3000);
        WillLib.Beneficiary memory b = will.getOneBeneficiary(1);
        assertEq(b.wallet, alice);
        assertEq(b.percent, 3000);
        assertEq(b.id, 1);
    }
    // function test_updateBeneficiaryAddr() public {
    //     vm.prank(owner);
    //     will.addBeneficiary(alice, 5000);
    //     address newWallet = address(0xff);

    //     vm.prank(owner);
    //     will.updateBeneficiaryAddress(1, newWallet);
    //     WillLib.Beneficiary memory b = will.getOneBeneficiary(1);
    //     assertEq(b.wallet, newWallet);
    // }

    // ── claim ─────────────────────────────────────────────────────────────

    function test_claim_full() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        // trigger — pulls funds from owner wallet
        vm.prank(signer1);
        will.triggerBySigners();

        uint256 balBefore = token.balanceOf(alice);

        vm.prank(alice);
        will.claim(1);

        // alice gets 100% of finalPool
        assertEq(token.balanceOf(alice), balBefore + finalPool);
    }

    function test_claim_partial_shares() public {
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

        uint256 aliceShare = (finalPool * 6000) / 10_000;
        uint256 bobShare = (finalPool * 4000) / 10_000;

        assertEq(token.balanceOf(alice), aliceShare);
        assertEq(token.balanceOf(bob), bobShare);
    }

    // ── negative ──────────────────────────────────────────────────────────

    function test_revert_duplicateBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(owner);
        vm.expectRevert("Wallet already a beneficiary");
        will.addBeneficiary(alice, 3000);
    }

    function test_revert_exceedsMaxPercent() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 8000);

        vm.prank(owner);
        vm.expectRevert("Total allocation exceeds 100%");
        will.addBeneficiary(bob, 3000);
    }

    function test_revert_claimBeforeTrigger() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(alice);
        vm.expectRevert("Will has not been triggered yet");
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

    function test_revert_addAfterLock() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(owner);
        vm.expectRevert("Will is locked");
        will.addBeneficiary(bob, 5000);
    }

    function test_revert_wrongBeneficiaryClaims() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(bob);
        vm.expectRevert("Not a valid benefactor"); // ✅ matches your modifier
        will.claim(1);
    }

    // ── new tests for your additions ──────────────────────────────────────

    function test_updateBeneficiaryAddr() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        address newWallet = makeAddr("newAlice");

        vm.prank(owner);
        will.updateBeneficiaryAddress(1, newWallet);

        // ✅ verify address was updated via getOneBeneficiary
        WillLib.Beneficiary memory b = will.getOneBeneficiary(1); // index 0 = id 1
        assertEq(b.wallet, newWallet);
    }

    function test_getOneBeneficiary() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        WillLib.Beneficiary memory b = will.getOneBeneficiary(1); // index 0
        assertEq(b.wallet, alice);
        assertEq(b.percent, 5000);
        assertEq(b.id, 1);
        assertFalse(b.claimed);
    }

    

    function test_revert_updateAddr_notOwner() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 5000);

        vm.prank(alice);
        vm.expectRevert("Not owner");
        will.updateBeneficiaryAddress(1, makeAddr("x"));
    }

    function test_revert_updateAddr_afterLock() public {
        vm.prank(owner);
        will.addBeneficiary(alice, 10_000);

        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(owner);
        vm.expectRevert("Will is locked");
        will.updateBeneficiaryAddress(1, makeAddr("x"));
    }
}
