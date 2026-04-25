// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/WillLib.sol";
import "../interfaces/IEvents.sol";
import "../base/WillBase.sol";

abstract contract SignerModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;

    function triggerBySigners() external {
        require(s.isSigner[msg.sender], "Not signer");
        require(!s.triggered, "Already triggered");
        require(!s.hasSigned[msg.sender], "Already signed");
        require(s.beneficiaries.length > 0, "No beneficiaries");
        require(s.totalDeposited > 0, "No funds");

        s.hasSigned[msg.sender] = true;
        s.signatureCount++;

        emit SignerAttested(msg.sender, s.signatureCount, s.requiredSignatures);

        if (s.signatureCount >= s.requiredSignatures) {
            _trigger();
        }
    }

    function revokeAttestation() external {
        require(s.isSigner[msg.sender], "Not signer");
        require(!s.triggered, "Already triggered");
        require(s.hasSigned[msg.sender], "Not signed");

        s.hasSigned[msg.sender] = false;
        s.signatureCount--;

        emit AttestationRevoked(msg.sender, s.signatureCount);
    }

    function replaceSigner(address oldSigner, address newSigner) external {
        require(msg.sender == s.owner, "Not owner");
        require(!s.locked, "Locked");
        require(s.isSigner[oldSigner], "Not a signer");
        require(newSigner != address(0), "Invalid address");
        require(!s.isSigner[newSigner], "Already signer");
        require(newSigner != s.owner, "Owner cannot be signer");

        s.isSigner[oldSigner] = false;
        s.isSigner[newSigner] = true;

        if (s.hasSigned[oldSigner]) {
            s.hasSigned[oldSigner] = false;
            s.signatureCount--;
        }

        for (uint256 i = 0; i < s.signers.length; i++) {
            if (s.signers[i] == oldSigner) {
                s.signers[i] = newSigner;
                break;
            }
        }

        emit SignerReplaced(oldSigner, newSigner);
    }

    function getSigners() external view returns (address[] memory) {
        return s.signers;
    }

    function _trigger() internal virtual;
}