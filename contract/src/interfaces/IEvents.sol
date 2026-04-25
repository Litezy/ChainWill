// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEvents {
    event Deposited(address indexed owner, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    event CheckIn(address indexed owner, uint256 timestamp);
    event WillLocked(uint256 timestamp);

    event GracePeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event InactivityPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    event InactivityTriggered(
        address indexed triggeredBy,
        uint256 triggeredAt,
        uint256 attestationStart,
        uint256 claimTrigger
    );

    event SignerAttested(
        address indexed signer,
        uint256 signatureCount,
        uint256 requiredSignatures
    );

    event AttestationRevoked(address indexed signer, uint256 signatureCount);
    event SignerReplaced(address indexed oldSigner, address indexed newSigner);

    event BeneficiaryAdded(
        uint256 indexed id,
        address indexed wallet,
        uint256 percent
    );
    event BeneficiaryUpdated(
        uint256 indexed id,
        address indexed wallet,
        uint256 oldPercent,
        uint256 newPercent
    );
    event BeneficiaryRemoved(uint256 indexed id, address indexed wallet);
    event BeneficiaryClaimed(
        uint256 indexed id,
        address indexed wallet,
        uint256 amount
    );
    event RecoveryRequested(address indexed newWallet);
    event WalletRecovered(address indexed oldOwner, address indexed newOwner);
    event WillCreated(address indexed will, address indexed owner, address indexed token);
}
