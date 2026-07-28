// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Minimal reputation slash registry for VRAV Security Hub.
 * Deploy on Polygon (or Amoy testnet). Operators call slash(appId).
 * Does NOT hold ERC20 — records on-chain slash events for transparency.
 *
 * Deploy example (Foundry):
 *   forge create contracts/VravReputationSlash.sol:VravReputationSlash --constructor-args <owner>
 */
contract VravReputationSlash {
    address public owner;
    mapping(bytes32 => bool) public slashed;
    mapping(bytes32 => address) public slashedBy;
    mapping(bytes32 => uint256) public slashedAt;

    event Slashed(bytes32 indexed appIdHash, string appId, address indexed operator, uint256 timestamp);
    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address initialOwner) {
        require(initialOwner != address(0), "zero owner");
        owner = initialOwner;
    }

    function appIdHash(string calldata appId) public pure returns (bytes32) {
        return keccak256(bytes(appId));
    }

    function isSlashed(string calldata appId) external view returns (bool) {
        return slashed[appIdHash(appId)];
    }

    function slash(string calldata appId) external onlyOwner {
        bytes32 h = appIdHash(appId);
        require(!slashed[h], "already slashed");
        slashed[h] = true;
        slashedBy[h] = msg.sender;
        slashedAt[h] = block.timestamp;
        emit Slashed(h, appId, msg.sender, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
    }
}
