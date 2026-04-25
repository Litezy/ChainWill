// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/ChainWill.sol";
import "../interfaces/IEvents.sol";

contract ChainWillFactory is IEvents {

    address public admin;

    // owner => list of their wills
    mapping(address => address[]) public ownerWills;

    // all deployed wills
    address[] public allWills;

    // will => exists
    mapping(address => bool) public isWill;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createWill(
        address token,
        address[] memory signers,
        uint256 inactivityPeriod
    ) external returns (address will) {
        require(token != address(0), "Invalid token");
        require(signers.length > 0, "No signers");
        require(inactivityPeriod > 0, "Invalid period");

        will = address(
            new ChainWill(
                token,
                signers,
                inactivityPeriod,
                msg.sender  // caller is the will owner
            )
        );

        ownerWills[msg.sender].push(will);
        allWills.push(will);
        isWill[will] = true;

        emit WillCreated(will, msg.sender, token);
    }

    function getWillsByOwner(address owner)
        external
        view
        returns (address[] memory)
    {
        return ownerWills[owner];
    }

    function getAllWills() external view returns (address[] memory) {
        return allWills;
    }

    function totalWills() external view returns (uint256) {
        return allWills.length;
    }
}