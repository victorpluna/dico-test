# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Dico Platform** - a decentralized ICO platform built with Next.js 14 and comprehensive Web3 integration. The project allows users to create, discover, and invest in Initial Coin Offerings through a secure, transparent platform.

## Essential Commands

### Development Commands
```bash
# Frontend development (primary workspace)
cd frontend
npm run dev          # Start development server with Turbopack (http://localhost:3000)
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint (configured to ignore warnings during builds)

# Project setup (from frontend directory)
npm install          # Install dependencies
```

### Build Configuration
- **ESLint and TypeScript errors are ignored during builds** (see `next.config.ts`)
- Development server runs with **Turbopack** for fast compilation
- Project uses **Tailwind CSS v4** with custom design system

## Architecture Overview

### Project Structure
```
frontend/                           # Main Next.js application
├── app/                           # Next.js App Router pages
│   ├── page.tsx                   # Landing page with projects grid
│   ├── dashboard/page.tsx         # User investment dashboard
│   ├── project/[id]/page.tsx      # Project detail view
│   └── project/create/page.tsx    # Project creation form
├── components/
│   ├── web3/                      # Web3 integration components
│   │   ├── WalletConnect.tsx      # Multi-wallet connection (MetaMask, WalletConnect, Coinbase)
│   │   ├── InvestModal.tsx        # 3-step investment flow
│   │   └── ClaimButton.tsx        # Token claiming with vesting
│   ├── project/                   # Project-specific components
│   │   ├── ProjectCard.tsx        # Glassmorphism project cards
│   │   ├── ProjectForm.tsx        # Multi-step project creation
│   │   ├── ProgressBar.tsx        # Funding progress visualization
│   │   └── CountdownTimer.tsx     # Time remaining display
│   └── providers/                 # React context providers
├── lib/
│   ├── store/                     # Zustand state management
│   │   ├── uiStore.ts            # Simple UI state (current implementation)
│   │   ├── projectStore.ts       # Project data management
│   │   ├── investmentStore.ts    # Investment tracking
│   │   └── userStore.ts          # User preferences and wallet state
│   └── web3/
│       ├── config.ts             # Web3 configuration (wagmi, RainbowKit)
│       └── hooks.ts              # Custom Web3 hooks
docs/                             # Comprehensive documentation
├── frontend/
│   ├── component-architecture.md # Detailed component implementation guide
│   └── state-management.md       # Zustand store architecture
└── ui-design/                    # Design system specifications
```

### Core Technologies
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **Web3**: wagmi, viem, RainbowKit, ethers.js v6
- **State Management**: Zustand with 4 specialized stores
- **Animations**: Framer Motion with micro-interactions
- **Design**: Glassmorphism UI with trust-building elements

### State Management Architecture

The application uses **4 specialized Zustand stores**:

1. **UI Store** (`uiStore.ts`) - Currently simplified version handling:
   - Toast notifications
   - Modal states (investment modal)
   - Loading states
   
2. **Project Store** (`projectStore.ts`) - Project management:
   - Project CRUD operations
   - Search and filtering with persistence
   - Draft auto-save functionality

3. **Investment Store** (`investmentStore.ts`) - Investment tracking:
   - User investment history
   - Portfolio performance metrics
   - Token claiming and vesting

4. **User Store** (`userStore.ts`) - User data:
   - Wallet connection state
   - User preferences with persistence
   - Notification management

**Important**: Current implementation uses a simplified `uiStore.ts` due to SSR compatibility. The full store architecture is documented but may need gradual migration.

### Web3 Integration

**Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet via RainbowKit
**Networks**: Mainnet, Sepolia testnet, local Hardhat
**Key Components**:
- `WalletConnect` - 3 variants (default, compact, minimal)
- `InvestModal` - 3-step investment flow with gas estimation
- `ClaimButton` - Vesting-aware token claiming

**Environment Variables**:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_DICO_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_DICO_TOKEN_ADDRESS=0x...
```

### Design System

**Colors**: Primary blue (#0066FF), semantic colors (green/amber/red)
**Typography**: Inter (body), JetBrains Mono (technical data)
**Animations**: 150-600ms micro-interactions, GPU-accelerated
**Accessibility**: WCAG AA compliant, full keyboard navigation

### SSR Considerations

- **SSR Wrapper** implemented for hydration issues
- **Toast components** have mounted state checks
- **Zustand stores** use simplified architecture for SSR compatibility
- Build configuration ignores TypeScript/ESLint errors for deployment

## Development Workflow

### Component Development
- All components are TypeScript with comprehensive type definitions
- Use exact Tailwind classes from design system specifications
- Implement Framer Motion animations as specified in docs
- Follow accessibility guidelines (ARIA labels, keyboard navigation)

### State Management
- Use store selectors for performance optimization
- Implement auto-save for form drafts
- Use optimistic updates with error rollback
- Persist user preferences and notification settings

### Web3 Development
- Validate all inputs (addresses, amounts, transaction parameters)
- Handle wallet connection states properly
- Implement proper gas estimation with user selection
- Provide clear transaction status feedback

### Debugging

**Server Error Checking Commands**:
```bash
# Start server in background with logging
npm run dev > server.log 2>&1 &

# Check if server is responding (wait for startup)
sleep 3 && curl -s http://localhost:3000 | head -1

# Check server logs for errors
tail -10 server.log

# Check detailed error in HTML response
curl -s http://localhost:3000 | grep -E "(error|Error|ERROR)" || echo "No errors found"

# Stop background server
pkill -f "next dev"
```

**Other Debugging Tools**:
- Check `server.log` for development server issues
- Redux DevTools integration for state debugging  
- Browser console shows Lit.dev warnings (expected in development)
- SSR errors typically indicate store hydration issues

## Important Notes

- **Current State**: Frontend is fully functional with all Web3 components working
- **Build Status**: Production builds work despite ESLint/TypeScript warnings
- **Next Phase**: Ready for smart contract implementation (Phase 4)
- **Documentation**: Comprehensive docs in `/docs` directory provide detailed implementation guidance

## Common Issues

1. **SSR Errors**: Use SSR wrapper and check mounted states in components
2. **Store Hydration**: Current simplified store architecture resolves most issues  
3. **Build Warnings**: Configured to ignore during builds, fix incrementally
4. **Web3 Errors**: Check wallet connection and network configuration