// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// contract FusionOrderRegistry {
//     enum OrderStatus { Pending, Filled, Cancelled, Expired }

//     struct Order {
//         address maker;
//         address receiver;
//         address fromToken;
//         address toToken;
//         uint256 createdAt;
//         OrderStatus status;
//         string network;
//     }

//     mapping(bytes32 => Order) public orders;
//     bytes32[] public orderHashes;

//     event OrderCreated(bytes32 indexed orderHash, address indexed maker, address indexed receiver);
//     event OrderUpdated(bytes32 indexed orderHash, OrderStatus status);

//     function registerOrder(
//         bytes32 orderHash,
//         address receiver,
//         address fromToken,
//         address toToken,
//         string calldata network
//     ) external {
//         require(orders[orderHash].createdAt == 0, "Order already exists");

//         orders[orderHash] = Order({
//             maker: msg.sender,
//             receiver: receiver,
//             fromToken: fromToken,
//             toToken: toToken,
//             createdAt: block.timestamp,
//             status: OrderStatus.Pending,
//             network: network
//         });

//         orderHashes.push(orderHash);
//         emit OrderCreated(orderHash, msg.sender, receiver);
//     }

//     function updateOrderStatus(bytes32 orderHash, OrderStatus newStatus) external {
//         require(orders[orderHash].createdAt != 0, "Order not found");
//         require(msg.sender == orders[orderHash].maker, "Only maker can update");

//         orders[orderHash].status = newStatus;
//         emit OrderUpdated(orderHash, newStatus);
//     }

//     function getOrder(bytes32 orderHash) external view returns (Order memory) {
//         return orders[orderHash];
//     }

//     function getAllOrders() external view returns (bytes32[] memory) {
//         return orderHashes;
//     }
// }