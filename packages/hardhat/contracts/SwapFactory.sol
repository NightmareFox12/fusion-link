// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AtomicSwapIntent.sol";

contract SwapFactory {
    address[] public allSwaps;

    event SwapCreated(address swapAddress, address indexed creator, address indexed receiver, uint256 value);

    /// @notice Creates a new instance of the AtomicSwapIntent contract
    /// @param hashlock keccak256 of the shared secret
    /// @param timelockSeconds maximum number of seconds to complete the swap
    /// @param receiver the address that will receive the funds upon presenting the correct secret
    function createSwap(bytes32 hashlock, uint256 timelockSeconds, address payable receiver) external payable {
        require(msg.value > 0, "Must send ETH to lock");

        AtomicSwapIntent newSwap = new AtomicSwapIntent{ value: msg.value }(hashlock, timelockSeconds, receiver);
        allSwaps.push(address(newSwap));

        emit SwapCreated(address(newSwap), msg.sender, receiver, msg.value);
    }

    function getSwapCount() external view returns (uint256) {
        return allSwaps.length;
    }

    function getSwapAddress(uint256 index) external view returns (address) {
        require(index < allSwaps.length, "Invalid index");
        return allSwaps[index];
    }

    function getAllSwaps() external view returns (address[] memory) {
        return allSwaps;
    }
}
