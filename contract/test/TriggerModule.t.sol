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

    address constant TOKEN = 0x9b068dC0418064C11d9bc563edC26890DD95a60e;

    address owner    = makeAddr("owner");
    address signer1  = makeAddr("signer1");
    address platform = makeAddr("platform");
    address ben      = makeAddr("ben");

    uint256 constant DEPOSIT = 100e18;

    function setUp() public {
        factory = new ChainWillFactory(platform);
        vm.etch(TOKEN, type(MockERC20).runtimeCode);
        token = MockERC20(TOKEN);

        // tokens stay in owner's wallet
        token.mint(owner, DEPOSIT);

        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](1);
        signers[0] = WillLib.SignerInput({wallet: signer1, name: "", email: ""});
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "",
            email: "",
            wallet: owner
        });

        vm.prank(owner);
        address willAddr = factory.createWill(signers, ownerInfo);
        will = ChainWill(willAddr);

        // owner approves the will to pull their tokens at trigger time
        vm.prank(owner);
        token.approve(address(will), DEPOSIT);

        // add a beneficiary
        vm.prank(owner);
        will.addBeneficiary(ben, 10_000, "", "", "");
    }

    function test_triggerByTime() public {
        // warp past inactivity period + grace period
        vm.warp(block.timestamp + 365 days + 7 days + 1);

        will.triggerByTime();

        // attestation is open, but the will itself is not yet triggered.
        assertFalse(will.isTriggered());
        assertFalse(will.isLocked());

        (bool available,,) = will.getAttestationStatus();
        assertTrue(available);

        // no tokens are pulled until a signer triggers the will.
        assertEq(token.balanceOf(owner), DEPOSIT);
        assertEq(token.balanceOf(address(will)), 0);
        assertEq(will.getFinalPool(), 0);
    }

    function test_triggerBySigners_pulls_funds() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        will.triggerByTime();

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
        will.triggerByTime();

        // triggerByTime only opens attestation; no funds are pulled yet.
        assertEq(will.getFinalPool(), 0);
        (bool available,,) = will.getAttestationStatus();
        assertTrue(available);
    }

    // ── negative ──────────────────────────────────────────────────────────

    function test_revert_triggerTooEarly() public {
        vm.expectRevert("Too early as inactivity period not elapsed");
        will.triggerByTime();
    }

    function test_repeat_triggerByTime_opens_attestation() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        will.triggerByTime();
        will.triggerByTime();

        (bool available,,) = will.getAttestationStatus();
        assertTrue(available);
    }

    function test_triggerByTime_opens_attestation_even_without_approval() public {
        // revoke approval
        vm.prank(owner);
        token.approve(address(will), 0);

        vm.warp(block.timestamp + 365 days + 7 days + 1);

        will.triggerByTime();

        (bool available,,) = will.getAttestationStatus();
        assertTrue(available);
    }

    function test_revert_trigger_noBeneficiaries() public {
        // deploy fresh will with no beneficiaries
        WillLib.SignerInput[] memory signers = new WillLib.SignerInput[](1);
        signers[0] = WillLib.SignerInput({wallet: signer1, name: "", email: ""});
        WillLib.OwnerInfo memory ownerInfo = WillLib.OwnerInfo({
            name: "",
            email: "",
            wallet: owner
        });

        vm.prank(owner);
        address w2 = factory.createWill(signers, ownerInfo);
        ChainWill will2 = ChainWill(w2);

        vm.prank(owner);
        token.approve(address(will2), DEPOSIT);

        vm.warp(block.timestamp + 365 days + 7 days + 1);

        vm.expectRevert("No beneficiaries set");
        will2.triggerByTime();
    }

    function test_revert_notAdminTrigger() public {
        vm.warp(block.timestamp + 365 days + 7 days + 1);
        vm.prank(makeAddr("stranger"));
        vm.expectRevert("Not Admin");
        will.triggerByTime();
    }
}
