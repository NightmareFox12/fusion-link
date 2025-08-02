import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// 📡 Etherlink RPC (you can change it to mainnet or testnet)
const ETHERLINK_RPC = 'https://node.ghostnet.etherlink.com'

const RELAYER_PRIVATE_KEY = '0xTuLlavePrivada'
const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)

const CONTRACT_ADDRESS = '0xTuDireccionDeContrato'

const abi = parseAbi([
  'event SecretRevealed(bytes32 secret)',
  'function executeSwap(bytes32 secret, uint256 fromChainId, uint256 toChainId, address fromToken, address toToken, bytes signature)'
])

// 🧠 Datos del swap (debes obtenerlos dinámicamente en producción)
const fromChainId = 12345n
const toChainId = 54321n
const fromToken = '0xTokenOrigen'
const toToken = '0xTokenDestino'
const signature = '0xFirmaDelUsuario' // Firma válida del intent

// 🛰️ Cliente público para leer eventos
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(ETHERLINK_RPC)
})

// 🧾 Cliente wallet para enviar transacciones
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(ETHERLINK_RPC)
})

async function main() {
  console.log('📡 Relayer with viem started...')

  publicClient.watchEvent({
    address: CONTRACT_ADDRESS,
    event: abi[0], // SecretRevealed
    onLogs: async logs => {
      for (const log of logs) {
        const secret = log.args.secret
        console.log(`🔓 Se reveló el secreto: ${secret}`)

        if (secret === undefined) return
          
        // Codifica la llamada a executeSwap
        const callData = encodeFunctionData({
          abi,
          functionName: 'executeSwap',
          args: [secret, fromChainId, toChainId, fromToken, toToken, signature]
        })

        try {
          const txHash = await walletClient.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: callData
          })

          console.log(`🚀 Swap ejecutado. TX: ${txHash}`)
        } catch (err) {
          console.error('❌ Error al ejecutar el swap:', err)
        }
      }
    }
  })

  console.log('✅ Escuchando eventos SecretRevealed...')
}

main().catch(console.error)
