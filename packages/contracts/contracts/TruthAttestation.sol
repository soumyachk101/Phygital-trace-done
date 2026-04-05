// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TruthAttestation is Ownable, Pausable {
    struct Attestation {
        bytes32 payloadHash;
        bytes32 ipfsCidBytes32;
        uint256 timestamp;
        address attester;
        bool revoked;
    }

    mapping(bytes32 => Attestation) public attestations;

    event Attested(
        bytes32 indexed payloadHash,
        string ipfsCid,
        uint256 timestamp,
        address indexed attester
    );

    event Revoked(
        bytes32 indexed payloadHash,
        address indexed revoker,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function attest(
        bytes32 payloadHash,
        bytes32 ipfsCidBytes32
    ) external onlyOwner whenNotPaused {
        require(
            attestations[payloadHash].attester == address(0),
            "Already attested"
        );
        require(payloadHash != bytes32(0), "Invalid payload hash");
        require(ipfsCidBytes32 != bytes32(0), "Invalid IPFS CID");

        attestations[payloadHash] = Attestation({
            payloadHash: payloadHash,
            ipfsCidBytes32: ipfsCidBytes32,
            timestamp: block.timestamp,
            attester: msg.sender,
            revoked: false
        });

        emit Attested(
            payloadHash,
            _bytes32ToString(ipfsCidBytes32),
            block.timestamp,
            msg.sender
        );
    }

    function attestBatch(
        bytes32[] calldata payloadHashes,
        bytes32[] calldata ipfsCidBatch
    ) external onlyOwner whenNotPaused {
        require(
            payloadHashes.length == ipfsCidBatch.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < payloadHashes.length; i++) {
            bytes32 payloadHash = payloadHashes[i];
            bytes32 ipfsCidBytes32 = ipfsCidBatch[i];
            
            require(payloadHash != bytes32(0), "Invalid payload hash");
            require(ipfsCidBytes32 != bytes32(0), "Invalid IPFS CID");

            if (attestations[payloadHash].attester == address(0)) {
                attestations[payloadHash] = Attestation({
                    payloadHash: payloadHash,
                    ipfsCidBytes32: ipfsCidBytes32,
                    timestamp: block.timestamp,
                    attester: msg.sender,
                    revoked: false
                });

                emit Attested(
                    payloadHash,
                    _bytes32ToString(ipfsCidBytes32),
                    block.timestamp,
                    msg.sender
                );
            }
        }
    }

    function verify(
        bytes32 payloadHash
    )
        external
        view
        returns (
            bool exists,
            uint256 timestamp,
            address attester,
            bool revoked
        )
    {
        Attestation storage a = attestations[payloadHash];
        exists = a.attester != address(0);
        timestamp = a.timestamp;
        attester = a.attester;
        revoked = a.revoked;
    }

    function revoke(bytes32 payloadHash) external onlyOwner whenNotPaused {
        require(
            attestations[payloadHash].attester != address(0),
            "Not attested"
        );
        require(!attestations[payloadHash].revoked, "Already revoked");
        attestations[payloadHash].revoked = true;

        emit Revoked(payloadHash, msg.sender, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _bytes32ToString(bytes32 _bytes) internal pure returns (string memory) {
        uint256 charCount = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (_bytes[i] != 0) {
                charCount++;
            } else {
                break;
            }
        }
        bytes memory result = new bytes(charCount);
        for (uint256 i = 0; i < charCount; i++) {
            result[i] = _bytes[i];
        }
        return string(result);
    }
}
