// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/// @title Cross-Chain Atomic Swap Intent ERC20 (Fusion+ Compatible)
/// @notice Contrato para swaps atómicos con hashlock y timelock que
///         puede usarse en flujos cross-chain con relayers como Fusion+.
contract FusionSwapIntentERC20 is EIP712 {
    address public sender;
    address public receiver;
    bytes32 public hashlock;
    uint256 public timelock;
    uint256 public amount;
    IERC20 public token;
    bool public withdrawn; 
    bool public refunded;

    bytes32 private constant SWAP_INTENT_TYPEHASH =
        keccak256(
            "SwapIntent(address sender,address receiver,uint256 fromChainId,uint256 toChainId,address fromToken,address toToken,uint256 amount,bytes32 hashlock,uint256 timelock)"
        );

    event SwapIntentCreated(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        bytes32 hashlock,
        uint256 timelock,
        uint256 amount
    );

    event SecretRevealed(bytes32 secret);
    event SwapExecuted(address executor, bytes32 secret);
    event SwapRefunded();

    constructor(
        string memory name,
        string memory version,
        address _sender,
        bytes32 _hashlock,
        uint256 _timelockSeconds,
        address _receiver,
        address _token,
        uint256 _amount
    ) EIP712(name, version) {
        require(_sender != address(0), "Invalid sender");
        require(_receiver != address(0), "Invalid receiver");
        require(_token != address(0), "Invalid token");
        require(_amount > 0, "Amount must be > 0");
        require(_timelockSeconds > 0, "Timelock must be positive");

        sender = _sender;
        receiver = _receiver;
        hashlock = _hashlock;
        timelock = block.timestamp + _timelockSeconds;
        token = IERC20(_token);
        amount = _amount;

        emit SwapIntentCreated(_sender, _receiver, _token, _hashlock, timelock, _amount);
    }

    /// @notice Publica el secreto para que solvers lo usen en otra cadena
    ///         (ej. para completar el swap en Optimism si se reveló en Etherlink)
    function revealSecret(bytes32 _secret) external {
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");
        emit SecretRevealed(_secret);
    }

    function verifySignature(
        address _sender,
        address _receiver,
        uint256 _fromChainId,
        uint256 _toChainId,
        address _fromToken,
        address _toToken,
        uint256 _amount,
        bytes32 _hashlock,
        uint256 _timelock,
        bytes memory signature
    ) internal view returns (bool) {
        bytes32 structHash = keccak256(
            abi.encode(
                SWAP_INTENT_TYPEHASH,
                _sender,
                _receiver,
                _fromChainId,
                _toChainId,
                _fromToken,
                _toToken,
                _amount,
                _hashlock,
                _timelock
            )
        );

        return SignatureChecker.isValidSignatureNow(_sender, _hashTypedDataV4(structHash), signature);
    }

    /// @notice Ejecuta el swap si se conoce el secreto.
    /// @dev Abierto para cualquier executor que tenga el preimagen válida.
    function executeSwap(
        bytes32 _secret,
        uint256 fromChainId,
        uint256 toChainId,
        address fromToken,
        address toToken,
        bytes memory signature
    ) external {
        bytes32 structHash = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    SWAP_INTENT_TYPEHASH,
                    sender,
                    receiver,
                    fromChainId,
                    toChainId,
                    fromToken,
                    toToken,
                    amount,
                    hashlock,
                    timelock
                )
            )
        );

        require(SignatureChecker.isValidSignatureNow(sender, structHash, signature), "Invalid signature");

        require(!withdrawn, "Already executed");
        require(!refunded, "Already refunded");
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");
        require(block.timestamp <= timelock, "Timelock has expired");
        withdrawn = true;
        require(token.transfer(receiver, amount), "Token transfer failed");
        emit SwapExecuted(msg.sender, _secret);
    }

    function refundSwap() external {
        require(block.timestamp > timelock, "Timelock not expired");
        require(msg.sender == sender, "Only sender can refund");
        require(!withdrawn, "Already executed");
        require(!refunded, "Already refunded");

        refunded = true;
        require(token.transfer(sender, amount), "Refund failed");
        emit SwapRefunded();
    }

    function getSwapStatus() external view returns (string memory) {
        if (withdrawn) return "Completed";
        if (refunded) return "Refunded";
        return "Pending";
    }
}
