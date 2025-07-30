// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FusionSwapIntentERC20.sol";

/// @title SwapFactory para desplegar y gestionar instancias de FusionSwapIntentERC20
/// @notice Permite la creación estandarizada de nuevos swaps atómicos ERC-20
///         y centraliza el depósito inicial de tokens del usuario.
contract SwapFactory {
    //states
    address[] public allSwaps;

    //events
    event SwapCreated(
        address swapAddress,     
        address indexed creator, 
        address indexed receiver, 
        address indexed token,    // La dirección del token ERC-20
        uint256 amount,     
        uint256 timelockEnd       // El timestamp Unix de finalización del timelock
    );

    /// @notice Crea una nueva instancia del contrato FusionSwapIntentERC20.
    ///         El usuario (msg.sender) debe haber APROBADO previamente
    ///         que esta Factory pueda gastar sus 'amount' de 'tokenAddress'.
    /// @param hashlock El hash keccak256 del secreto compartido.
    /// @param timelockSeconds Duración del timelock en segundos.
    /// @param receiver Dirección que recibirá los tokens si presenta el secreto.
    /// @param tokenAddress Dirección del contrato del token ERC-20 a intercambiar.
    /// @param amount Cantidad de tokens a intercambiar.
    function createSwap(
        bytes32 hashlock,
        uint256 timelockSeconds,
        address receiver,
        address tokenAddress,
        uint256 amount
    ) external {
        // Validaciones iniciales
        require(amount > 0, "Amount must be greater than zero.");
        require(receiver != address(0), "Receiver address required.");
        require(tokenAddress != address(0), "Token address required.");
        require(timelockSeconds > 0, "Timelock must be positive.");

        IERC20 tokenInstance = IERC20(tokenAddress);

        // Paso 1: Mover los tokens del USUARIO (msg.sender) a la Factory.
        // El usuario debe haber llamado a token.approve(address(this), amount) ANTES de llamar a esta función.
        require(
            tokenInstance.transferFrom(msg.sender, address(this), amount),
            "Token transfer from user to factory failed. Check allowance."
        );

        // Paso 2: Crear la nueva instancia del contrato FusionSwapIntentERC20.
        // Pasamos msg.sender como el '_sender' original para el FusionSwapIntentERC20
        // para que ese contrato sepa quién tiene los derechos de reembolso.
        FusionSwapIntentERC20 newSwap = new FusionSwapIntentERC20(
            msg.sender,         
            hashlock,
            timelockSeconds,
            receiver,
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

        emit SwapCreated(
            address(newSwap),
            msg.sender,
            receiver,
            tokenAddress,
            amount,
            block.timestamp + timelockSeconds
        );
    }

    function getSwapCount() external view returns (uint256) {
        return allSwaps.length;
    }

    function getSwapAddress(uint256 index) external view returns (address) {
        require(index < allSwaps.length, "Invalid index.");
        return allSwaps[index];
    }

    function getAllSwaps() external view returns (address[] memory) {
        return allSwaps;
    }
}