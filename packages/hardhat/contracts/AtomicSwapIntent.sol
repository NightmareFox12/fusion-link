// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Atomic Swap with Hashlock/Timelock for Intent-Based Execution
contract AtomicSwapIntent {
    address payable public sender;
    address payable public receiver;
    bytes32 public hashlock;
    uint256 public timelock;
    uint256 public amount;
    bool public withdrawn;
    bool public refunded;

    event SwapIntentCreated(
        address indexed sender,
        address indexed receiver,
        bytes32 hashlock,
        uint256 timelock,
        uint256 amount
    );

    event SwapExecuted(bytes32 secret);
    event SwapRefunded();

    constructor(
        bytes32 _hashlock,
        uint256 _timelockSeconds,
        address payable _receiver
    ) payable {
        require(msg.value > 0, "Funds required");
        sender = payable(msg.sender);
        receiver = _receiver;
        hashlock = _hashlock;
        timelock = block.timestamp + _timelockSeconds;
        amount = msg.value;

        emit SwapIntentCreated(sender, receiver, hashlock, timelock, amount);
    }

    function executeSwap(bytes32 _secret) external {
        require(!withdrawn, "Already withdrawn");
        require(!refunded, "Already refunded");
        require(msg.sender == receiver, "Only receiver can execute");
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");

        withdrawn = true;
        receiver.transfer(amount);
        emit SwapExecuted(_secret);
    }

    function refundSwap() external {
        require(block.timestamp > timelock, "Timelock not expired");
        require(msg.sender == sender, "Only sender can refund");
        require(!withdrawn, "Already withdrawn");
        require(!refunded, "Already refunded");

        refunded = true;
        sender.transfer(amount);
        emit SwapRefunded();
    }

    function getRemainingTime() external view returns (uint256) {
        if (block.timestamp >= timelock) return 0;
        return timelock - block.timestamp;
    }

    function getSwapStatus() external view returns (string memory) {
        if (withdrawn) return "Completed";
        if (refunded) return "Refunded";
        return "Pending";
    }
}
