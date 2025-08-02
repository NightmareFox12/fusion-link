// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FusionSwapIntentERC20.sol";

/// @title SwapFactory to deploy and manage instances of FusionSwapIntentERC20
/// @notice Enables the standardized creation of new ERC-20 atomic swaps
contract SwapFactory {
    //states
    mapping(address => address) public swaps;
    uint256 public swapCounter;
    string name = "FusionSwapIntentERC20";
    string version = "1";

    event SwapCreated(
        address swapAddress,
        address indexed creator,
        address indexed receiver,
        address indexed token, 
        uint256 amount,
        uint256 timelockEnd
    );

    function createSwap(
        bytes32 hashlock,
        uint256 timelockSeconds,
        address receiver,
        address tokenAddress,
        uint256 amount
    ) external {
        require(amount > 0, "Amount must be greater than zero.");
        require(receiver != address(0), "Receiver address required.");
        require(tokenAddress != address(0), "Token address required.");
        require(timelockSeconds > 0, "Timelock must be positive.");

        IERC20 tokenInstance = IERC20(tokenAddress);
        address user = msg.sender;

        require(
            tokenInstance.transferFrom(user, address(this), amount),
            "Token transfer from user to factory failed. Check allowance."
        );

        FusionSwapIntentERC20 newSwap = new FusionSwapIntentERC20(
            name,
            version,
            user,
            hashlock,
            timelockSeconds,
            receiver,
            tokenAddress,
            amount
        );

        require(
            tokenInstance.transfer(address(newSwap), amount),
            "Token transfer from factory to new swap contract failed."
        );

        swaps[user] = address(newSwap);
        swapCounter++;

        emit SwapCreated(
            address(newSwap),
            msg.sender,
            receiver,
            tokenAddress,
            amount,
            block.timestamp + timelockSeconds
        );
    }
}
