// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";

interface IChainWill {
    function checkIn() external;
    function triggerByTime() external;
    function triggerBySigners() external;
    function revokeAttestation() external;
    function addBeneficiary(address wallet, uint256 percent, string calldata name, string calldata email, string calldata role) external;
    function removeBeneficiary(uint256 id) external;
    function updateBeneficiaryPercentage(uint256 id, uint256 newPercent) external;
    function updateBeneficiaryAddress(uint256 id,address _newWallet) external;
    function updateBeneficiary(uint256 id, address wallet, uint256 percent, string calldata name, string calldata email, string calldata role) external;
    function claim(uint256 id) external;
    function replaceSigner(address oldSigner, address newSigner, string calldata name, string calldata email) external;
    function getSignerByEmail(string calldata email) external view returns (WillLib.Signer memory);
    function getBeneficiaryByEmail(string calldata email) external view returns (WillLib.Beneficiary memory);
    function requestWalletChange(address newWallet) external;
    function confirmWalletChange() external;
    function setGracePeriod(uint256 newGracePeriod) external;
    function setInactivityPeriod(uint256 newPeriod) external;
}