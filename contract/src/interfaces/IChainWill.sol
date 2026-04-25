// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IChainWill {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function checkIn() external;
    function triggerByTime() external;
    function triggerBySigners() external;
    function revokeAttestation() external;
    function addBeneficiary(address wallet, uint256 percent) external;
    function removeBeneficiary(uint256 id) external;
    function updateBeneficiary(uint256 id, uint256 newPercent) external;
    function claim(uint256 id) external;
    function replaceSigner(address oldSigner, address newSigner) external;
    function requestWalletChange(address newWallet) external;
    function confirmWalletChange() external;
    function setGracePeriod(uint256 newGracePeriod) external;
    function setInactivityPeriod(uint256 newPeriod) external;
}