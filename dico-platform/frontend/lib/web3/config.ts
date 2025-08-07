import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, hardhat } from 'viem/chains'

// Configure wagmi with supported chains
export const config = getDefaultConfig({
  appName: 'Dico Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dico-platform-default',
  chains: [
    mainnet,
    sepolia,
    ...(process.env.NODE_ENV === 'development' ? [hardhat] : []),
  ],
  ssr: true, // Enable server-side rendering support
})

// Chain configuration for different environments
export const SUPPORTED_CHAINS = {
  mainnet: {
    id: 1,
    name: 'Ethereum Mainnet',
    network: 'mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia Testnet',
    network: 'sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  hardhat: {
    id: 31337,
    name: 'Hardhat Local',
    network: 'hardhat',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'http://localhost:8545',
  },
} as const

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  // Mainnet addresses (to be updated after mainnet deployment)
  1: {
    DICO_FACTORY: process.env.NEXT_PUBLIC_DICO_FACTORY_ADDRESS_MAINNET || '',
    DICO_TOKEN: process.env.NEXT_PUBLIC_DICO_TOKEN_ADDRESS_MAINNET || '',
  },
  // Sepolia testnet addresses
  11155111: {
    DICO_FACTORY: process.env.NEXT_PUBLIC_DICO_FACTORY_ADDRESS_SEPOLIA || '',
    DICO_TOKEN: process.env.NEXT_PUBLIC_DICO_TOKEN_ADDRESS_SEPOLIA || '',
  },
  // Hardhat local addresses
  31337: {
    DICO_FACTORY: process.env.NEXT_PUBLIC_DICO_FACTORY_ADDRESS_HARDHAT || '',
    DICO_TOKEN: process.env.NEXT_PUBLIC_DICO_TOKEN_ADDRESS_HARDHAT || '',
  },
} as const

// Helper function to get contract addresses for current network
export const getContractAddresses = (chainId: number) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[31337]
}

// Gas estimation settings
export const GAS_SETTINGS = {
  STANDARD_MULTIPLIER: 1.1,
  FAST_MULTIPLIER: 1.25,
  PRIORITY_FEE: {
    STANDARD: '2000000000', // 2 gwei
    FAST: '3000000000', // 3 gwei
  },
} as const

// Transaction timeout in milliseconds
export const TRANSACTION_TIMEOUT = 60000 // 1 minute