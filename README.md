# Dico Platform - Decentralized ICO Platform

![Dico Platform](https://img.shields.io/badge/Dico-Platform-blue?style=for-the-badge&logo=ethereum) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

> **A complete decentralized platform for launching and participating in ICOs (Initial Coin Offerings) with integrated vesting system.**

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Environment Setup](#-environment-setup)
- [Installation and Setup](#-installation-and-setup)
- [Running the Project](#-running-the-project)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

## 🌟 Overview

The **Dico Platform** is a decentralized platform that enables the creation and participation in ICOs in a secure and transparent manner. The project offers:

- **For Creators**: Tools to launch ICOs with customizable configurations
- **For Investors**: Intuitive interface to discover and invest in projects
- **For the Community**: Decentralized and transparent governance system

### 🎯 Key Benefits

- ✅ **Security**: Audited smart contracts with advanced protections
- ✅ **Transparency**: Open source and verifiable code on blockchain
- ✅ **Flexibility**: Customizable configurations for each project
- ✅ **Automatic Vesting**: Gradual token release system
- ✅ **Refunds**: Protection for investors in failed projects

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contracts │    │   Blockchain    │
│   Next.js 14    │───▶│    Ethereum      │───▶│    Network      │
│   TypeScript    │    │    Solidity      │    │   (ETH/Sepolia) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼───────────────────────────────┐
                                 │                               │
                    ┌─────────────▼──────────┐    ┌─────────────▼──────────┐
                    │     DicoFactory        │    │      DicoToken         │
                    │   (ICO Creation)       │    │   (Platform Token)     │
                    └─────────────┬──────────┘    └────────────────────────┘
                                  │
                    ┌─────────────▼──────────┐    ┌────────────────────────┐
                    │     DicoProject        │    │     DicoVesting        │
                    │   (Individual ICO)     │    │   (Vesting System)     │
                    └────────────────────────┘    └────────────────────────┘
```

## 🚀 Features

### For Project Creators

- 📝 **ICO Creation**: Intuitive interface to configure projects
- ⚙️ **Flexible Configuration**: Define price, duration, custom vesting
- 💰 **Fund Withdrawal**: Automatic access to funds after success
- 📊 **Dashboard**: Track your project progress in real-time

### For Investors

- 🔍 **Project Discovery**: Explore ICOs with advanced filters
- 💵 **Safe Investment**: Minimum investments of 0.01 ETH
- 🎁 **Token Claiming**: Automatic redemption with vesting system
- 💸 **Refunds**: Automatic protection for failed projects

### Platform System

- 🏛️ **Governance**: DICO token for community decisions
- 💼 **Fees**: 2.5% fee on successful projects
- 📈 **Analytics**: Complete platform statistics
- 🔒 **Security**: Audited and verified contracts

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Wagmi + Viem** for Web3 integration
- **RainbowKit** for wallet connections

### Smart Contracts

- **Solidity 0.8.20** for contracts
- **Hardhat** for development
- **OpenZeppelin** for security
- **Ethers.js v6** for interactions
- **Chai + Mocha** for testing

### DevOps & Tools

- **ESLint + Prettier** for clean code
- **Jest** for unit tests
- **TypeChain** for contract types
- **Etherscan** for verification

## ⚙️ Environment Setup

### Prerequisites

Make sure you have installed:

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **Git** for version control

### Environment Variables

#### For Smart Contracts (`dico-platform/contracts/.env`)

```bash
# Network URLs
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY

# Deployment
PRIVATE_KEY=your-private-key-here
DEPLOYER_ADDRESS=your-deployer-address-here

# Verification
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key
```

#### For Frontend (`dico-platform/frontend/.env.local`)

```bash
# Network Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_CHAIN_ID=31337

# Contract Addresses - Hardhat Local
NEXT_PUBLIC_DICO_TOKEN_ADDRESS_HARDHAT=0x...
NEXT_PUBLIC_DICO_FACTORY_ADDRESS_HARDHAT=0x...

# Contract Addresses - Sepolia Testnet
NEXT_PUBLIC_DICO_TOKEN_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_DICO_FACTORY_ADDRESS_SEPOLIA=0x...

# API Keys
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Getting the Required Keys

1. **Alchemy API Key**: [alchemy.com](https://alchemy.com) → Create App → Copy the URL
2. **Etherscan API Key**: [etherscan.io/apis](https://etherscan.io/apis) → Create API Key
3. **WalletConnect Project ID**: [cloud.walletconnect.com](https://cloud.walletconnect.com) → Create Project
4. **Private Key**: Export from MetaMask (⚠️ **NEVER** commit this key!)

## 📦 Installation and Setup

### 1. Clone the Repository

```bash
git clone git@github.com:victorpluna/dico-test.git
cd dico-test
```

### 2. Install Dependencies

#### Smart Contracts

```bash
cd dico-platform/contracts
npm install
```

#### Frontend

```bash
cd dico-platform/frontend
npm install
```

### 3. Configure Environment Variables

```bash
# Contracts
cd dico-platform/contracts
cp .env.example .env
# Edit the .env file with your configurations

# Frontend
cd dico-platform/frontend
cp .env.example .env.local
# Edit the .env.local file with your configurations
```

## 🏃‍♂️ Running the Project

### Complete Local Development

#### 1. Start the Local Hardhat Network

```bash
cd dico-platform/contracts
npm run node
```

This will start a local blockchain at `http://localhost:8545` with 20 test accounts.

#### 2. Deploy Contracts (in another terminal)

```bash
cd dico-platform/contracts
npm run deploy:localhost
```

After deployment, copy the contract addresses to the frontend's `.env.local` file.

#### 3. Create a Sample Project (optional)

```bash
cd dico-platform/contracts
node scripts/create-sample-project.js --network localhost
```

#### 4. Start the Frontend

```bash
cd dico-platform/frontend
npm run dev
```

Access the project at `http://localhost:3000`.

### 🎯 MetaMask Configuration

1. **Add the local network**:

   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Symbol: `ETH`

2. **Import a test account**:
   - Copy a private key from the Hardhat terminal
   - MetaMask → Import Account → Paste the private key

## 🧪 Testing

### Smart Contract Tests

```bash
cd dico-platform/contracts

# Run all tests
npm test

# Tests with coverage
npm run test:coverage

# Tests with gas report
REPORT_GAS=true npm test

# Specific tests
npm test -- --grep "DicoFactory"
npm test -- --grep "Integration"
```

### Frontend Tests

```bash
cd dico-platform/frontend

# Unit tests
npm run test

# Tests in watch mode
npm run test:watch

# Integration tests (E2E)
npm run test:e2e
```

### Test Reports

After running tests, you'll find:

- **Coverage Report**: `contracts/coverage/index.html`
- **Gas Report**: In terminal during execution
- **Test Results**: In terminal with details of each test

## 🚀 Deployment

### Deploy to Sepolia Testnet

```bash
cd dico-platform/contracts

# Deploy
npm run deploy:sepolia

# Verify contracts
npm run verify:sepolia

# Create example project
node scripts/create-sample-project.js --network sepolia
```

### Deploy to Mainnet

⚠️ **WARNING**: Only for production after security audit!

```bash
cd dico-platform/contracts

# Deploy
npm run deploy:mainnet

# Verify contracts
npm run verify:mainnet
```

### Post-Deployment Configuration

1. **Update contract addresses** in the frontend
2. **Configure WalletConnect** with valid Project ID
3. **Test all functionalities** on testnet first
4. **Monitor transactions** and gas usage

## 🔧 Useful Commands

### Smart Contracts

```bash
# Development
npm run build          # Compile contracts
npm run clean          # Clean artifacts
npm run node           # Hardhat local network

# Deploy and Verification
npm run deploy:localhost
npm run deploy:sepolia
npm run deploy:mainnet
npm run verify:sepolia
npm run verify:mainnet

# Utilities
npm run test:coverage  # Test coverage
npm run gas-report     # Gas report
```

### Frontend

```bash
# Development
npm run dev            # Development server
npm run build          # Production build
npm run start          # Production server
npm run lint           # Check ESLint
npm run type-check     # Check TypeScript

# Utilities
npm run analyze        # Analyze bundle
npm run clean          # Clean cache
```

### Git and Versioning

```bash
# Basic commands already configured
git add .
git commit -m "feat: new feature"
git push origin main

# Check contract status
git status
git log --oneline -10
```

## 📁 Project Structure

```
dico-test/
├── dico-platform/                  # Main project
│   ├── contracts/                  # Smart contracts
│   │   ├── contracts/              # Solidity code
│   │   │   ├── DicoToken.sol      # Platform token
│   │   │   ├── DicoFactory.sol    # ICO factory
│   │   │   ├── DicoProject.sol    # Individual ICO contract
│   │   │   └── DicoVesting.sol    # Vesting system
│   │   ├── scripts/               # Deploy scripts
│   │   ├── test/                  # Contract tests
│   │   ├── deployments/           # Deployed addresses
│   │   └── README.md              # Contract docs
│   │
│   ├── frontend/                   # Next.js interface
│   │   ├── app/                   # Pages (App Router)
│   │   ├── components/            # React components
│   │   │   ├── web3/              # Web3 components
│   │   │   ├── project/           # Project components
│   │   │   └── ui/                # UI components
│   │   ├── lib/                   # Utilities and hooks
│   │   │   ├── web3/              # Web3 configuration
│   │   │   └── store/             # Global state
│   │   └── public/                # Static assets
│   │
│   ├── docs/                       # Documentation
│   │   ├── frontend/              # Frontend docs
│   │   ├── ui-design/             # Design specifications
│   │   └── ux-research/           # UX research
│   │
│   ├── agent-handoff/             # Handoff files
│   └── CLAUDE.md                  # Claude guide
│
├── README.md                       # This file
├── dico-prompt                     # Original prompt
└── dico-prompt-builder.md         # Prompt construction
```

## 🤝 Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a branch for your feature (`git checkout -b feat/new-feature`)
3. **Commit** your changes (`git commit -m 'feat: add new feature'`)
4. **Push** to the branch (`git push origin feat/new-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint + Prettier** configured
- **Conventional Commits** for messages
- **TypeScript** mandatory
- **Tests** mandatory for new features
- **Documentation** updated

### Roadmap

- [ ] **Phase 5**: DAO Governance
- [ ] **Phase 6**: Mobile App (React Native)
- [ ] **Phase 7**: Layer 2 Integration (Polygon)
- [ ] **Phase 8**: Cross-chain Support

## 📚 Documentation

### Complete Documentation

- **[CLAUDE.md](dico-platform/CLAUDE.md)**: Complete development guide
- **[Contracts README](dico-platform/contracts/README.md)**: Smart contracts documentation
- **[Component Architecture](dico-platform/docs/frontend/component-architecture.md)**: Component architecture
- **[State Management](dico-platform/docs/frontend/state-management.md)**: State management
- **[Design System](dico-platform/docs/ui-design/design-system.md)**: Design system

### Useful Links

- **[Hardhat Docs](https://hardhat.org/docs)**: Hardhat documentation
- **[Next.js Docs](https://nextjs.org/docs)**: Next.js documentation
- **[Wagmi Docs](https://wagmi.sh)**: Wagmi documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)**: Tailwind documentation

## 🔐 Security

### Security Considerations

- ✅ **Audited Contracts**: Comprehensive security testing
- ✅ **ReentrancyGuard**: Protection against reentrancy attacks
- ✅ **Access Control**: Proper access control
- ✅ **Input Validation**: Complete parameter validation
- ✅ **Pause Mechanism**: Emergency pause functionality

### Reporting Vulnerabilities

If you find security vulnerabilities:

1. **DO NOT** open a public issue
2. **Send** an email to: security@dico-platform.com
3. **Include** vulnerability details
4. **Wait** for our response within 48h

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 Dico Platform Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Dico Platform** - Democratizing access to ICOs through decentralization

[Website](https://dico-platform.com) • [Discord](https://discord.gg/dico) • [Twitter](https://twitter.com/dico_platform) • [Telegram](https://t.me/dico_platform)

Made with ❤️ by the blockchain community

</div>
