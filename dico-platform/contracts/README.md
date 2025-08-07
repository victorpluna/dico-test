# Dico Platform Smart Contracts

This directory contains the smart contracts for the Dico Platform - a decentralized ICO (Initial Coin Offering) platform built on Ethereum.

## Overview

The Dico Platform enables creators to launch ICO projects and investors to participate in token sales with built-in vesting mechanisms. The platform consists of four main smart contracts working together to provide a complete ICO ecosystem.

## Smart Contracts

### 1. DicoToken.sol
The platform's native ERC20 utility token used for governance and platform operations.

**Features:**
- ERC20 compliant with extensions (Burnable, Permit)
- 1 billion max supply with initial 100 million tokens
- Controlled minting with owner permissions
- Pause functionality for emergency stops
- Batch transfer capabilities
- Vesting contract management

**Key Functions:**
- `mint(address to, uint256 amount)` - Mint new tokens (owner only)
- `batchTransfer(address[] recipients, uint256[] amounts)` - Efficient multi-transfer
- `addVestingContract(address vestingContract)` - Register vesting contracts
- `pause()`/`unpause()` - Emergency controls

### 2. DicoFactory.sol
Factory contract for creating and managing ICO projects on the platform.

**Features:**
- Project creation with configurable parameters
- Platform fee collection (default 2.5%)
- Project verification system
- Statistics tracking
- Pagination support for project queries

**Key Functions:**
- `createProject(...)` - Create new ICO project
- `verifyProject(address projectContract)` - Verify legitimate projects
- `getProjectsPaginated(uint256 offset, uint256 limit)` - Get projects with pagination
- `getPlatformStats()` - Get platform statistics

### 3. DicoProject.sol
Individual ICO project contract with investment and token distribution logic.

**Features:**
- ETH-based investment with automatic token calculation
- Configurable investment limits (0.01 - 100 ETH)
- Time-based project lifecycle management
- Automatic vesting contract deployment on success
- Refund mechanism for failed projects
- Real-time progress tracking

**Key Functions:**
- `invest()` - Make investment in ETH
- `withdrawFunds()` - Creator withdraws raised funds (after success)
- `claimTokens()` - Investors claim vested tokens
- `claimRefund()` - Get refund for failed projects
- `getProjectInfo()` - Get comprehensive project data

### 4. DicoVesting.sol
Token vesting contract with linear release schedule and cliff period.

**Features:**
- Linear vesting with configurable cliff period
- Multiple beneficiary support
- Partial claim capabilities
- Vesting schedule management
- Emergency withdrawal after vesting completion

**Key Functions:**
- `createVestingSchedule(address beneficiary, uint256 amount)` - Set up vesting
- `claimTokens()` - Claim available vested tokens
- `getVestingInfo(address beneficiary)` - Get detailed vesting information
- `revokeVesting(address beneficiary)` - Revoke vesting (owner only)

## Architecture

```
DicoFactory
    ├── Creates DicoProject instances
    ├── Manages platform fees and verification
    └── Tracks global statistics

DicoProject
    ├── Handles investments and token sales
    ├── Creates DicoVesting on success
    ├── Manages project lifecycle
    └── Distributes tokens via vesting

DicoVesting
    ├── Linear token vesting with cliff
    ├── Multiple beneficiary support
    └── Partial claiming mechanism

DicoToken
    ├── Platform utility token
    ├── Governance and fee payments
    └── Vesting contract integration
```

## Deployment

### Prerequisites
- Node.js 18+ and npm
- Hardhat development environment
- Private key for deployment account
- Network RPC URLs (Alchemy/Infura recommended)

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Deploy to Hardhat Local
```bash
# Start local hardhat node
npm run node

# Deploy contracts (in another terminal)
npm run deploy:localhost
```

### Deploy to Testnet (Sepolia)
```bash
npm run deploy:sepolia
```

### Deploy to Mainnet
```bash
npm run deploy:mainnet
```

### Contract Verification
After deployment, verify on Etherscan:
```bash
npm run verify:sepolia  # For testnet
npm run verify:mainnet  # For mainnet
```

## Testing

The contracts include comprehensive test coverage with unit and integration tests.

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Gas Reporting
```bash
REPORT_GAS=true npm test
```

## Contract Addresses

Deployed contract addresses are saved in the `deployments/` directory after deployment:

### Hardhat Local
- Check `deployments/hardhat-31337.json` after local deployment

### Sepolia Testnet
- Check `deployments/sepolia-11155111.json` after testnet deployment

### Mainnet
- Check `deployments/mainnet-1.json` after mainnet deployment

## Security Considerations

### Implemented Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only functions with proper modifiers
- **Pause Mechanism**: Emergency stop functionality
- **Input Validation**: Comprehensive parameter checking
- **Safe Math**: Using Solidity 0.8+ built-in overflow protection
- **Gas Optimizations**: Efficient contract interactions

### Audit Recommendations
Before mainnet deployment:
1. Professional smart contract audit
2. Bug bounty program
3. Gradual rollout with smaller limits
4. Multi-signature wallet for admin functions
5. Time delays for critical parameter changes

## Integration with Frontend

### Required Environment Variables
```bash
# Add to frontend .env
NEXT_PUBLIC_DICO_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_DICO_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=1  # or 11155111 for Sepolia
```

### ABI Files
Contract ABIs are available in `artifacts/contracts/` after compilation or in the frontend integration files.

## Gas Optimization

### Estimated Gas Costs (Sepolia)
- DicoToken deployment: ~2,500,000 gas
- DicoFactory deployment: ~4,000,000 gas  
- Project creation: ~3,500,000 gas
- Investment: ~100,000 gas
- Token claiming: ~80,000 gas

### Cost Savings Features
- Batch operations where possible
- Efficient data structures
- Minimal external calls
- Optimized loops and storage access

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error**
   - Ensure deployer account has enough ETH for gas

2. **"Contract not verified" on Etherscan**
   - Run verification script after deployment
   - Check Etherscan API key configuration

3. **Frontend integration issues**
   - Verify contract addresses in environment variables
   - Check network configuration matches deployed network

4. **Transaction reverts**
   - Check transaction parameters meet contract requirements
   - Verify sufficient gas limit

### Debugging Tools
- Use `hardhat console` for contract interaction
- Check `artifacts/contracts/` for ABI files
- Review deployment logs in `deployments/` directory
- Use Hardhat's `console.log` in contracts for debugging

## Development Workflow

### Testing New Features
1. Write unit tests first
2. Implement contract logic
3. Run full test suite
4. Test on local hardhat network
5. Deploy to testnet for integration testing
6. Get security review before mainnet

### Making Changes
1. Create feature branch
2. Implement and test changes
3. Update documentation
4. Create deployment scripts if needed
5. Test on all supported networks

## License

MIT License - see LICENSE file for details.

## Support

For technical support:
1. Check existing GitHub issues
2. Review documentation in `docs/` directory
3. Create new issue with detailed problem description
4. Include network, transaction hash, and error messages