# Fusion Link

![Fusion-Link-logo](/packages/nextjs/public/favicon.png)

Fusion Link is a prototype developed for ETHGlobal Unite's **“Hack the Stack: Bring Fusion+ to Etherlink”** track. Our project not only integrates, but creates the infrastructure necessary for the 1inch Fusion+ protocol to operate on the Etherlink network, a capability that does not exist natively.

The solution addresses this interoperability challenge by implementing a Hashed Timelock Atomic Swaps (HTLC) system. The prototype allows users to initiate a cross-chain swap between Etherlink Testnet and Optimism Testnet through an intuitive user interface.

The DApp flow is clear and secure

1. The user approves the token expenditure.

2. He calls the **createSwap** function in our **SwapFactory** contract to initiate the swap, which deploys a new instance of the **FusionSwapIntentERC20** contract.

3. The user signs an off-chain message containing the swap details. This signature, which follows the **EIP712 standard**, authorizes the transaction and is crucial for the relayer to execute the swap on the destination network securely and without the user having to pay gas again.

From there, our custom relayer system takes charge of coordinating the trustless and secure token swap between the two networks. This way, Etherlink users can benefit from the advantages of 1inch Fusion+ **such as gasless transactions and MEV protection** while leveraging the low fees and high speed of the Tezos L2 network.

## ⛏️🛠️ Architecture and Technical Components

### Smart Contracts

- **SwapFactory.sol**: This contract is the main factory. Users interact with it to initiate a new **cross-chain** swap. It handles the logic of the initial token transfer from the user to the factory and then dynamically deploys a new instance of **FusionSwapIntentERC20** for each swap. Its main function is to act as a secure, standardized entry point for swap creation.

- **FusionSwapIntentERC20.sol**: This is the heart of the DApp logic and represents an individual atomic swap with a hashlock and timelock. Once deployed by the factory, this contract manages the entire swap lifecycle:

1. **createSwap**: Initializes the swap and ensures that the funds are locked in.

2. **executeSwap**: Allows an executor (in this case, the relayer) to claim the funds once the valid secret is provided.

3. **refundSwap**: If the timelock expires, this function allows the initiator of the swap to recover its funds.

4. The contract uses the **EIP712** library for signature verification, ensuring that the message signed by the user is authentic and has not been tampered with.
