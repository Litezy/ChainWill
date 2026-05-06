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
        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](2);
        signers[0] = WillLib.SignerInput({wallet: signer1, name: "Signer One", email: "one@example.com"});
        signers[1] = WillLib.SignerInput({wallet: signer2, name: "Signer Two", email: "two@example.com"});
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "Owner One",
            email: "owner@example.com",
            wallet: owner
        });

        vm.startPrank(owner);
        address will = factory.createWill(signers, ownerInfo);
        vm.stopPrank();

        assertTrue(factory.isWill(will));
        assertEq(factory.totalWills(), 1);
        assertEq(factory.getWillsByOwner(owner)[0], will);

        ChainWill deployedWill = ChainWill(will);
        (string memory name, string memory email, address wallet) = deployedWill.getOwnerProfile();
        assertEq(wallet, owner);
        assertEq(name, "Owner One");
        assertEq(email, "owner@example.com");
    }

    function test_createWill_storesProvidedOwnerInfo() public {
        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](2);
        signers[0] = WillLib.SignerInput({wallet: signer1, name: "", email: ""});
        signers[1] = WillLib.SignerInput({wallet: signer2, name: "", email: ""});

        vm.startPrank(owner);
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "Jane Doe",
            email: "jane@example.com",
            wallet: owner
        });

        address will = factory.createWill(signers, ownerInfo);
        vm.stopPrank();

        ChainWill deployedWill = ChainWill(will);
        (string memory name, string memory email, address wallet) = deployedWill.getOwnerProfile();
        assertEq(wallet, owner);
        assertEq(name, "Jane Doe");
        assertEq(email, "jane@example.com");
    }

    function test_createMultipleWills() public {
        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](1);
        signers[0] = WillLib.SignerInput({wallet: signer1, name: "", email: ""});
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "Owner",
            email: "owner@example.com",
            wallet: owner
        });

        vm.startPrank(owner);
        factory.createWill(signers, ownerInfo);
        factory.createWill(signers, ownerInfo);
        vm.stopPrank();

        assertEq(factory.getWillsByOwner(owner).length, 2);
        assertEq(factory.totalWills(), 2);
    }

    // ── negative ───────────────────────────────────────────
    function test_revert_noSigners() public {
        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](0);
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "Owner",
            email: "owner@example.com",
            wallet: owner
        });

        vm.expectRevert("At least one signer required"); // ✅ matches contract
        factory.createWill(signers, ownerInfo);
    }
}
