// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/ChainWillFactory.sol";
import "../src/core/ChainWill.sol";
import "./mocks/MockERC20.sol";

contract SignerModuleTest is Test {
    ChainWillFactory factory;
    ChainWill will;
    MockERC20 token;

    address owner   = makeAddr("owner");
    address signer1 = makeAddr("signer1");
    address signer2 = makeAddr("signer2");
    address stranger = makeAddr("stranger");

    function setUp() public {
        factory = new ChainWillFactory();
        token   = new MockERC20();
        token.mint(owner, 1000e18);

        address[] memory signers = new address[](2);
        signers[0] = signer1;
        signers[1] = signer2;

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

    function test_triggerBySigners_bothSign() public {
        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(signer2);
        will.triggerBySigners();

        assertTrue(will.isTriggered());
    }

    function test_revokeAttestation() public {
        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(signer1);
        will.revokeAttestation();

        assertFalse(will.isTriggered());
    }

    function test_replaceSigner() public {
        address newSigner = makeAddr("newSigner");

        vm.prank(owner);
        will.replaceSigner(signer1, newSigner);

        address[] memory signers = will.getSigners();
        bool found = false;
        for (uint i = 0; i < signers.length; i++) {
            if (signers[i] == newSigner) found = true;
        }
        assertTrue(found);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_strangerTrigger() public {
        vm.prank(stranger);
        vm.expectRevert("Not signer");
        will.triggerBySigners();
    }

    function test_revert_signTwice() public {
        vm.prank(signer1);
        will.triggerBySigners();

        vm.prank(signer1);
        vm.expectRevert("Already signed");
        will.triggerBySigners();
    }

    function test_revert_revokeWithoutSign() public {
        vm.prank(signer1);
        vm.expectRevert("Not signed");
        will.revokeAttestation();
    }

    function test_revert_replaceWithOwner() public {
        vm.prank(owner);
        vm.expectRevert("Owner cannot be signer");
        will.replaceSigner(signer1, owner);
    }

    function test_revert_replaceNonSigner() public {
        vm.prank(owner);
        vm.expectRevert("Not a signer");
        will.replaceSigner(stranger, makeAddr("x"));
    }
}