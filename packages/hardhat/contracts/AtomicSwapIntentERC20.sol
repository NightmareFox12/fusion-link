// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Importa la interfaz estándar ERC-20

/// @title Atomic Swap with Hashlock/Timelock for ERC-20 Tokens
/// @notice Este contrato facilita un swap atómico de tokens ERC-20 con hashlock y timelock.
///         Está diseñado para operar en UNA SOLA CADENA. Los tokens deben ser
///         enviados a este contrato externamente (ej. por un Factory).
contract AtomicSwapIntentERC20 {
    // Declaración de variables de estado
    address public sender;          // La dirección que inicia el swap y "posee" los tokens inicialmente
    address public receiver;        // La dirección que puede reclamar los tokens con el secreto
    address public executor;        // Dirección autorizada para ejecutar el swap (ej: un solver de 1inch Fusion+)
    bytes32 public hashlock;        // El hash del secreto (keccak256(secreto))
    uint256 public timelock;        // El timestamp Unix después del cual el remitente puede reclamar
    uint256 public amount;          // La cantidad de tokens ERC-20 bloqueados
    bool public withdrawn;          // Indica si el receptor ya retiró los tokens
    bool public refunded;           // Indica si el remitente ya reclamó un reembolso
    IERC20 public token;            // La interfaz del contrato del token ERC-20 que se está utilizando

    // Eventos para rastrear el ciclo de vida del swap
    event SwapIntentCreated(
        address indexed sender,
        address indexed receiver,
        address indexed tokenAddress,
        bytes32 hashlock,
        uint256 timelock,
        uint256 amount,
        address executor
    );
    event SwapExecuted(bytes32 secret);
    event SwapRefunded();

    /// @notice Constructor para crear una nueva instancia de swap atómico de tokens ERC-20.
    ///         Este constructor es llamado por la Factory, que a su vez recibió los tokens del usuario.
    /// @param _sender La dirección del usuario original que inició el swap.
    /// @param _hashlock El hash del secreto pre-imagen.
    /// @param _timelockSeconds El número de segundos desde la creación después del cual el remitente puede reembolsar.
    /// @param _receiver La dirección que puede ejecutar el swap con el secreto.
    /// @param _executor La dirección que tiene permiso para ejecutar el swap, además del receptor.
    /// @param _tokenAddress La dirección del contrato del token ERC-20 a intercambiar.
    /// @param _amount La cantidad de tokens ERC-20 a bloquear.
    constructor(
        address _sender,            // Nuevo: para almacenar la dirección original del usuario
        bytes32 _hashlock,
        uint256 _timelockSeconds,
        address _receiver,
        address _executor,
        address _tokenAddress,
        uint256 _amount
    ) {
        // Validaciones iniciales
        require(_amount > 0, "Amount must be greater than zero.");
        require(_sender != address(0), "Sender address cannot be zero."); // Validamos el sender original
        require(_receiver != address(0), "Receiver address cannot be zero.");
        require(_executor != address(0), "Executor address cannot be zero.");
        require(_tokenAddress != address(0), "Token address cannot be zero.");
        require(_timelockSeconds > 0, "Timelock must be positive.");

        // Asignación de variables de estado
        sender = _sender; // Almacenamos el sender original del usuario
        receiver = _receiver;
        executor = _executor;
        hashlock = _hashlock;
        timelock = block.timestamp + _timelockSeconds;
        amount = _amount;
        token = IERC20(_tokenAddress); // Inicializa la interfaz del token

        // NOTA: La transferencia de tokens del usuario a este contrato es manejada
        //       por el contrato Factory que despliega esta instancia.
        //       No hay un 'transferFrom' aquí.

        // Emitir evento para registrar la creación del swap
        emit SwapIntentCreated(sender, receiver, _tokenAddress, hashlock, timelock, amount, executor);
    }

    /// @notice Permite al receptor o al ejecutor ejecutar el swap y reclamar los tokens.
    /// @param _secret El secreto pre-imagen que se hasheó para obtener el hashlock.
    function executeSwap(bytes32 _secret) external {
        // Validaciones para la ejecución
        require(!withdrawn, "Already withdrawn.");
        require(!refunded, "Already refunded.");
        require(
            msg.sender == receiver || msg.sender == executor,
            "Unauthorized executor or receiver."
        );
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret.");

        // Marcar como retirado y transferir los tokens al receptor
        withdrawn = true;
        // El token.balanceOf(address(this)) debe ser al menos 'amount' aquí.
        // Esto es garantizado por la factory que lo transfirió previamente.
        require(token.transfer(receiver, amount), "Token transfer failed during execution.");
        emit SwapExecuted(_secret);
    }

    /// @notice Permite al remitente original reembolsar sus tokens si el timelock ha expirado
    ///         y el swap no fue ejecutado.
    function refundSwap() external {
        // Validaciones para el reembolso
        require(block.timestamp > timelock, "Timelock not expired.");
        require(msg.sender == sender, "Only sender can refund."); // msg.sender es el sender original
        require(!withdrawn, "Already withdrawn.");
        require(!refunded, "Already refunded.");

        // Marcar como reembolsado y transferir los tokens de vuelta al remitente
        refunded = true;
        require(token.transfer(sender, amount), "Token refund failed.");
        emit SwapRefunded();
    }

    /// @notice Devuelve el tiempo restante hasta que el timelock expire.
    /// @return El tiempo restante en segundos.
    function getRemainingTime() external view returns (uint256) {
        return block.timestamp >= timelock ? 0 : timelock - block.timestamp;
    }

    /// @notice Devuelve el estado actual del swap.
    /// @return Una cadena de texto que describe el estado ("Completed", "Refunded", "Pending").
    function getSwapStatus() external view returns (string memory) {
        if (withdrawn) return "Completed";
        if (refunded) return "Refunded";
        return "Pending";
    }
}