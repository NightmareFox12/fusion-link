// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Cross-Chain Atomic Swap Intent ERC20 (Fusion+ Compatible)
/// @notice Contrato para swaps atómicos con hashlock y timelock que
///         puede usarse en flujos cross-chain con relayers como Fusion+.
contract FusionSwapIntentERC20 {
    address public sender; // Quien crea el swap (y puede pedir reembolso)
    address public receiver; // Quien recibe los fondos si revela el secreto
    bytes32 public hashlock; // keccak256(secreto)
    uint256 public timelock; // Expiración Unix timestamp
    uint256 public amount; // Tokens bloqueados
    IERC20 public token; // Token ERC-20
    bool public withdrawn; // Swap ejecutado con éxito
    bool public refunded; // Reembolso ejecutado

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
        address _sender,
        bytes32 _hashlock,
        uint256 _timelockSeconds,
        address _receiver,
        address _token,
        uint256 _amount
    ) {
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

    /// @notice Ejecuta el swap si se conoce el secreto.
    /// @dev Abierto para cualquier executor que tenga el preimagen válida.
    function executeSwap(bytes32 _secret) external {
        require(!withdrawn, "Already executed");
        require(!refunded, "Already refunded");
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");

        withdrawn = true;
        require(token.transfer(receiver, amount), "Token transfer failed");
        emit SwapExecuted(msg.sender, _secret);
    }

    /// @notice Permite al sender reembolsar si nadie reveló el secreto antes del timelock.
    function refundSwap() external {
        require(block.timestamp > timelock, "Timelock not expired");
        require(msg.sender == sender, "Only sender can refund");
        require(!withdrawn, "Already executed");
        require(!refunded, "Already refunded");

        refunded = true;
        require(token.transfer(sender, amount), "Refund failed");
        emit SwapRefunded();
    }

    /// @return Estado actual como texto
    function getSwapStatus() external view returns (string memory) {
        if (withdrawn) return "Completed";
        if (refunded) return "Refunded";
        return "Pending";
    }
}

