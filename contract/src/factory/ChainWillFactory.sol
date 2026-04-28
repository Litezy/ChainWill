// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/ChainWill.sol";
import "../interfaces/IEvents.sol";

/// @title ChainWillFactory
/// @notice Deploys and tracks ChainWill instances.
///         Each user gets their own ChainWill contract.
///
/// ONBOARDING FLOW:
///   1. User calls createWill() → their ChainWill is deployed
///   2. User calls token.approve(willAddress, amount) on the token contract
///      → tokens stay in user's wallet, will contract just has spending permission
///   3. User sets up beneficiaries and signers on their will
///   4. User checks in regularly
///   5. At trigger → will pulls approved amount from user's wallet
///
contract ChainWillFactory is IEvents {

    // ─────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────

    address public admin;
    address public platformAddress; // receives 0.5% fee from all wills

    mapping(address => address[]) public ownerWills; // owner => their will addresses
    address[] public allWills;                        // every will ever deployed
    mapping(address => bool) public isWill;           // quick lookup

    // ─────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────
    event PlatformAddressUpdated(address oldAddress, address newAddress);

    // ─────────────────────────────────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────
    constructor(address _platformAddress) {
        require(_platformAddress != address(0), "Invalid platform address");
        admin           = msg.sender;
        platformAddress = _platformAddress;
    }

    // ─────────────────────────────────────────────────────────────────────
    // CREATE WILL
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Deploys a new ChainWill for the caller.
    ///         After calling this, the user should call:
    ///         token.approve(returnedWillAddress, desiredAmount)
    ///         to grant the will spending permission on their tokens.
    ///
    /// @param token            ERC20 token address
    /// @param signers          Trusted signer addresses (min 1)
    /// @param inactivityPeriod Seconds of inactivity before attestation opens
    /// @return will            Address of the deployed ChainWill contract
    function createWill(
        address   token,
        address[] memory signers,
        uint256   inactivityPeriod
    ) external returns (address will) {
        require(signers.length   > 0,           "At least one signer required");
        require(inactivityPeriod > 0,           "Inactivity period must be > 0");

        will = address(new ChainWill(
            admin,
            signers,
            2 minutes,
            msg.sender,      // caller becomes the will owner
            platformAddress  // platform fee recipient from factory
        ));

        ownerWills[msg.sender].push(will);
        allWills.push(will);
        isWill[will] = true;

        emit WillCreated(will, msg.sender, token);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Admin can update the platform fee address.
    ///         New wills use the updated address — existing wills keep their address.
    function setPlatformAddress(address newAddress) external onlyAdmin {
        require(newAddress != address(0), "Invalid address");
        address old = platformAddress;
        platformAddress = newAddress;
        emit PlatformAddressUpdated(old, newAddress);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns all will addresses owned by a given address.
    function getWillsByOwner(address owner)
        external view
        returns (address[] memory)
    {
        return ownerWills[owner];
    }

    /// @notice Returns every will ever deployed through this factory.
    function getAllWills() external view returns (address[] memory) {
        return allWills;
    }

    /// @notice Returns total number of wills deployed.
    function totalWills() external view returns (uint256) {
        return allWills.length;
    }
}