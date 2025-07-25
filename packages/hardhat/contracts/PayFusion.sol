//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @author NightmareFox12
 */

contract PayFusion is Ownable {
    struct Order {
        address creator;
        uint256 chainId;
        address token; // address(0) = Ether
        Status status;
    }

    // State Variables
    uint256 orderID;
    mapping(address => string) emails;
    mapping(uint256 => Order) public orders;

    // Events
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

    constructor(address _owner) Ownable(_owner) {}

    function savePreferences(uint256 _chainId, address _token, string memory _email) public {
        address creator = msg.sender;

        if (bytes(_email).length > 0 && bytes(_email).length >= 5) {
            emails[creator] = _email;
        }

        orders[orderID] = Order({ creator: creator, chainId: _chainId, token: _token, status: Status.Open });

        // emit OrderCreated(newOrderId, msg.sender, chainId, token, amount);
        // return newOrderId;
        orderID++;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");

        (bool success, ) = payable(owner()).call{ value: balance }("");
        require(success, "Failed to send Ether");
    }

    // Function that allows the contract to receive ETH
    receive() external payable {}

    // CHAT GPT
    enum Status {
        Open,
        Completed,
        Cancelled
    }

    // function createOrder(uint256 chainId, address token, uint256 amount) external returns (uint256) {
    //     require(amount > 0, "Monto debe ser > 0");

    //     _orderIds.increment();
    //     uint256 newOrderId = _orderIds.current();

    //     orders[newOrderId] = Order({
    //         creator: msg.sender,
    //         chainId: chainId,
    //         token: token,
    //         amount: amount,
    //         status: Status.Open
    //     });

    //     emit OrderCreated(newOrderId, msg.sender, chainId, token, amount);
    //     return newOrderId;
    // }
}