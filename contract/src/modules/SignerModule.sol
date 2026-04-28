// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/WillBase.sol";
import "../interfaces/IEvents.sol";

/// @title SignerModule
/// @notice Manages signer-based trigger (multisig attestation of death).
abstract contract SignerModule is WillBase, IEvents {
    using WillLib for WillLib.WillStorage;

    // ─────────────────────────────────────────────────────────────────────
    // ATTEST
    // ─────────────────────────────────────────────────────────────────────

    /// @notice A signer calls this to attest the owner is deceased.
    ///         Once requiredSignatures threshold is met, trigger fires automatically.
    function triggerBySigners() external {
        require(s.isSigner[msg.sender],    "Not a registered signer");
        require(!s.triggered,              "Will already triggered");
        require(!s.hasSigned[msg.sender],  "You have already attested");
        require(s.attestationOpen,          "Attestation not open yet"); // 
        require(s.beneficiaries.length > 0, "No beneficiaries set");

        // record this signer's attestation
        s.hasSigned[msg.sender] = true;
        s.signatureCount++;

        emit SignerAttested(msg.sender, s.signatureCount, s.requiredSignatures);

        // if threshold met → execute trigger
        if (s.signatureCount >= s.requiredSignatures) {
            _trigger();
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // REVOKE
    // ─────────────────────────────────────────────────────────────────────

    /// @notice A signer can withdraw their attestation.
    ///         Useful if the owner comes back or the attestation was premature.
    ///         Cannot revoke after will is already triggered.
    function revokeAttestation() external {
        require(s.isSigner[msg.sender],   "Not a registered signer");
        require(!s.triggered,             "Will already triggered and cannot revoke");
        require(s.hasSigned[msg.sender],  "You have not attested yet");

        s.hasSigned[msg.sender] = false;
        s.signatureCount--;

        emit AttestationRevoked(msg.sender, s.signatureCount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // MANAGE SIGNERS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Owner replaces one signer with another.
    ///         If old signer had already attested, their vote is removed.
    /// @param oldSigner Address of signer to remove
    /// @param newSigner Address of signer to add
    function replaceSigner(address oldSigner, address newSigner) external {
        require(msg.sender == s.owner,    "Not owner");
        require(!s.locked,                "Will is locked");
        require(s.isSigner[oldSigner],    "Old address is not a signer");
        require(newSigner != address(0),  "Invalid new signer address");
        require(!s.isSigner[newSigner],   "New address is already a signer");
        require(newSigner != s.owner,     "Owner cannot be a signer");

        // remove old signer
        s.isSigner[oldSigner] = false;

        // if old signer had attested — remove their vote
        if (s.hasSigned[oldSigner]) {
            s.hasSigned[oldSigner] = false;
            s.signatureCount--;
        }

        // add new signer
        s.isSigner[newSigner] = true;

        // update the signers array
        for (uint256 i = 0; i < s.signers.length; i++) {
            if (s.signers[i] == oldSigner) {
                s.signers[i] = newSigner;
                break;
            }
        }

        emit SignerReplaced(oldSigner, newSigner);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns full list of registered signers.
    function getSigners() external view returns (address[] memory) {
        return s.signers;
    }

    /// @notice Returns current attestation count vs required.
    function getAttestationStatus() external view returns (
        bool _available,
        uint256 count,
        uint256 required
    ) {
        return (s.attestationOpen, s.signatureCount, s.requiredSignatures);
    }

    

    // ─────────────────────────────────────────────────────────────────────
    // INTERNAL — implemented by TriggerModule, resolved in ChainWill
    // ─────────────────────────────────────────────────────────────────────
    function _trigger() internal virtual;
}