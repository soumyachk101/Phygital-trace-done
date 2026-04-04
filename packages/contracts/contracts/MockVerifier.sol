// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockVerifier {
    mapping(bytes32 => bool) public verified;

    event MockVerified(bytes32 indexed payloadHash);

    function verify(bytes32 payloadHash) external {
        verified[payloadHash] = true;
        emit MockVerified(payloadHash);
    }

    function isVerified(bytes32 payloadHash) external view returns (bool) {
        return verified[payloadHash];
    }
}
