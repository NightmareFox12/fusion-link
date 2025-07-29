// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Necesario para interactuar con el token
import "./AtomicSwapIntentERC20.sol"; // Importa el contrato de swap atómico

/// @title SwapFactory para desplegar y gestionar instancias de AtomicSwapIntentERC20
/// @notice Permite la creación estandarizada de nuevos swaps atómicos ERC-20
///         y centraliza el depósito inicial de tokens del usuario.
contract SwapFactory {
    address[] public allSwaps; // Almacena las direcciones de todos los contratos de swap creados

    // Evento que se emite cuando se crea un nuevo contrato de swap
    event SwapCreated(
        address swapAddress,      // Dirección del nuevo contrato de swap
        address indexed creator,  // El usuario que inició la creación del swap (msg.sender de la factory)
        address indexed receiver, // El receptor final de los tokens
        address indexed token,    // La dirección del token ERC-20
        uint256 amount,           // La cantidad de tokens
        uint256 timelockEnd       // El timestamp Unix de finalización del timelock
    );

    /// @notice Crea una nueva instancia del contrato AtomicSwapIntentERC20.
    ///         El usuario (msg.sender) debe haber APROBADO previamente
    ///         que esta Factory pueda gastar sus 'amount' de 'tokenAddress'.
    /// @param hashlock El hash keccak256 del secreto compartido.
    /// @param timelockSeconds Duración del timelock en segundos.
    /// @param receiver Dirección que recibirá los tokens si presenta el secreto.
    /// @param executor Dirección autorizada para ejecutar el swap (ej: un solver de 1inch Fusion+).
    /// @param tokenAddress Dirección del contrato del token ERC-20 a intercambiar.
    /// @param amount Cantidad de tokens a intercambiar.
    function createSwap(
        bytes32 hashlock,
        uint256 timelockSeconds,
        address receiver,
        address executor,
        address tokenAddress,
        uint256 amount
    ) external {
        // Validaciones iniciales
        require(amount > 0, "Amount must be greater than zero.");
        require(receiver != address(0), "Receiver address required.");
        require(executor != address(0), "Executor address required.");
        require(tokenAddress != address(0), "Token address required.");
        require(timelockSeconds > 0, "Timelock must be positive.");

        // Referencia al contrato del token ERC-20
        IERC20 tokenInstance = IERC20(tokenAddress);

        // Paso 1: Mover los tokens del USUARIO (msg.sender) a la Factory.
        // El usuario debe haber llamado a token.approve(address(this), amount) ANTES de llamar a esta función.
        require(
            tokenInstance.transferFrom(msg.sender, address(this), amount),
            "Token transfer from user to factory failed. Check allowance."
        );

        // Paso 2: Crear la nueva instancia del contrato AtomicSwapIntentERC20.
        // Pasamos msg.sender como el '_sender' original para el AtomicSwapIntentERC20
        // para que ese contrato sepa quién tiene los derechos de reembolso.
        AtomicSwapIntentERC20 newSwap = new AtomicSwapIntentERC20(
            msg.sender,         // El usuario original que crea el intent
            hashlock,
            timelockSeconds,
            receiver,
            executor,
            tokenAddress,
            amount
        );

        // Paso 3: Mover los tokens de la Factory al nuevo contrato de swap.
        // Ahora los tokens están en la Factory, y se transfieren al contrato de swap recién creado.
        require(
            tokenInstance.transfer(address(newSwap), amount),
            "Token transfer from factory to new swap contract failed."
        );

        // Almacenar la dirección del nuevo contrato de swap
        allSwaps.push(address(newSwap));

        // Emitir evento para registrar la creación del swap
        emit SwapCreated(
            address(newSwap),
            msg.sender,
            receiver,
            tokenAddress,
            amount,
            block.timestamp + timelockSeconds
        );
    }

    /// @notice Devuelve el número total de contratos de swap creados.
    function getSwapCount() external view returns (uint256) {
        return allSwaps.length;
    }

    /// @notice Devuelve la dirección de un contrato de swap dado su índice.
    /// @param index El índice del contrato de swap en la lista.
    function getSwapAddress(uint256 index) external view returns (address) {
        require(index < allSwaps.length, "Invalid index.");
        return allSwaps[index];
    }

    /// @notice Devuelve un array con todas las direcciones de los contratos de swap creados.
    function getAllSwaps() external view returns (address[] memory) {
        return allSwaps;
    }
}