# Dico Platform - Frontend Component Architecture

## Overview

This document outlines the implementation of the Dico Platform's frontend web3 integration components, built with Next.js 14, TypeScript, Tailwind CSS, and comprehensive web3 tooling including wagmi, RainbowKit, and ethers.js v6.

## Technology Stack

### Core Framework
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS v4** with inline theme configuration
- **Inter & JetBrains Mono** fonts for professional typography
- **Framer Motion** for smooth animations and micro-interactions

### Web3 Integration
- **wagmi** for React hooks and wallet state management
- **viem** for Ethereum interactions and type safety
- **RainbowKit** for wallet connection UI
- **ethers.js v6** for gas estimation and transaction handling
- **zustand** for global state management (ready for expansion)

### Design System Compliance
- Full adherence to Phase 2 design system specifications
- WCAG AA accessibility standards
- Professional color palette with primary blue (#0066FF)
- Trust-building UI patterns and verification indicators

## Component Architecture

### 1. Web3 Configuration (`lib/web3/config.ts`)

Centralized configuration for all web3 functionality:

```typescript
// Supported chains with environment-based configuration
export const config = getDefaultConfig({
  appName: 'Dico Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, sepolia, hardhat],
  ssr: true,
})

// Contract addresses and gas settings
export const CONTRACT_ADDRESSES = {
  DICO_FACTORY: process.env.NEXT_PUBLIC_DICO_FACTORY_ADDRESS,
  DICO_TOKEN: process.env.NEXT_PUBLIC_DICO_TOKEN_ADDRESS,
}
```

**Features:**
- Multi-chain support (Mainnet, Sepolia, Local Hardhat)
- Environment variable configuration
- Gas optimization settings
- SSR compatibility

### 2. Web3 Hooks (`lib/web3/hooks.ts`)

Custom React hooks for wallet interactions and transaction handling:

#### `useWalletConnection()`
- Wallet connection state management
- Address formatting and display utilities
- Connection status indicators

#### `useWalletBalance()`
- Real-time ETH balance fetching
- Formatted balance display (4 decimal places)
- Loading and error states

#### `useGasEstimation()`
- Dynamic gas fee estimation
- Standard vs Fast transaction options
- Real-time network fee calculation

#### `useTransactionHandler()`
- Transaction status tracking (preparing → pending → confirming → success/error)
- Error handling with user-friendly messages
- Transaction timeout management

#### `useInvestment()` & `useClaim()`
- Specialized hooks for investment and claim flows
- Input validation and business logic
- Integration with gas estimation

### 3. Core Components

#### WalletConnect Component (`components/web3/WalletConnect.tsx`)

**Three Variants:**
- **Default**: Full-featured with balance display and dropdown menu
- **Compact**: Streamlined version without balance
- **Minimal**: Simple connect/disconnect button

**Key Features:**
- Multi-wallet support (MetaMask, WalletConnect, Coinbase Wallet)
- Custom RainbowKit theming matching design system
- Responsive design with mobile optimizations
- Framer Motion animations for smooth interactions
- Dropdown menu with account management options

**Design Elements:**
- Trust indicators with connection status
- Professional styling with hover effects
- Accessibility-first keyboard navigation
- Error states for unsupported networks

#### InvestModal Component (`components/web3/InvestModal.tsx`)

**3-Step Investment Flow:**

1. **Amount Input Step**
   - ETH amount validation (0.01-100 ETH range)
   - Real-time USD conversion display
   - Quick amount buttons (0.1, 0.5, 1 ETH, Max)
   - Gas fee selection (Standard/Fast)
   - Live investment summary calculation

2. **Review & Confirmation Step**
   - Project details and verification status
   - Investment summary with token calculations
   - Risk acknowledgment checkboxes
   - Terms of service agreement

3. **Processing Step**
   - Real-time transaction status updates
   - Wallet confirmation prompts
   - Success/error state handling
   - Etherscan transaction links

**Technical Implementation:**
- Form validation with Zod-ready structure
- Ethers.js v6 gas estimation integration
- Framer Motion step transitions
- Mobile-responsive modal design
- Error recovery mechanisms

#### ClaimButton Component (`components/web3/ClaimButton.tsx`)

**Vesting & Claims Management:**
- Claimable amount calculation and display
- Vesting schedule visualization with progress bars
- Interactive details toggle with animation
- Transaction status tracking
- Success/error state management

**Features:**
- Visual vesting progress indicators
- Next unlock date calculations
- Batch claiming optimization
- Responsive design for mobile interfaces
- Accessibility compliance with screen readers

## Design System Integration

### Color Implementation
- Primary Blue: `#0066ff` for CTAs and key actions
- Semantic colors: Green (success), Amber (warning), Red (error)
- Professional grays for hierarchy and content
- Trust indicators with verification badges

### Typography
- Inter font family for readability and trust
- JetBrains Mono for addresses and technical data
- Consistent heading hierarchy (H1-H6)
- Proper line heights and spacing

### Animation Strategy
- **Micro-interactions**: 150-300ms hover/focus transitions
- **Component entrances**: 400-600ms with stagger delays
- **Progress animations**: 1.2-1.5s smooth fills with shimmer effects
- **Error handling**: Shake animations for validation errors
- **Success celebrations**: Subtle scale/color transitions

### Accessibility Features
- WCAG AA compliant contrast ratios
- Comprehensive ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management for modals
- Reduced motion support via `prefers-reduced-motion`

## State Management Architecture

### Local Component State
- Form inputs and validation states
- Modal open/close states
- UI interaction states (hover, focus, loading)

### Web3 State (wagmi/React Query)
- Wallet connection status
- Account balances and transaction history
- Network information and chain switching
- Transaction pending/success/error states

### Global State (Future Zustand Integration)
```typescript
interface ProjectStore {
  projects: Project[]
  selectedProject: Project | null
  investmentHistory: Investment[]
  claimedTokens: ClaimedToken[]
}
```

## Error Handling Strategy

### User-Friendly Error Messages
- Wallet rejection: "Transaction was cancelled by user"
- Insufficient funds: "Insufficient funds for transaction"
- Network issues: "Network error occurred"
- Gas estimation: "Transaction failed due to gas estimation issues"

### Error Recovery Patterns
- Automatic retry for transient failures
- Clear error state indicators
- Action buttons for user recovery
- Detailed error information for debugging

## Performance Optimizations

### Bundle Size
- Tree-shaking for unused code
- Dynamic imports for heavy components
- Optimized font loading strategies

### Runtime Performance
- React.memo for expensive components
- useCallback for stable function references
- Lazy loading for non-critical components
- Efficient re-rendering patterns

### Web3 Performance
- Request batching for blockchain calls
- Caching strategies for balance queries
- Connection pooling for multiple providers

## Mobile Responsiveness

### Breakpoint Strategy
- Mobile-first design approach
- Consistent spacing across breakpoints
- Touch-friendly interface elements
- Optimized modal sizes for mobile

### Mobile-Specific Optimizations
- Touch gesture support
- Larger tap targets (minimum 44px)
- Simplified navigation patterns
- Reduced animation complexity for performance

## Security Considerations

### Input Validation
- Client-side and server-side validation
- XSS prevention through proper sanitization
- CSRF protection for form submissions

### Web3 Security
- Address validation and checksums
- Transaction parameter verification
- Secure storage of sensitive data
- Protection against common attack vectors

## Testing Strategy

### Component Testing
- Jest + React Testing Library
- Component isolation and mocking
- User interaction testing
- Accessibility testing with axe-core

### Web3 Testing
- Mock wallet providers for unit tests
- Integration testing with test networks
- Gas estimation accuracy testing
- Error scenario coverage

### E2E Testing
- Cypress for full user flows
- Wallet connection scenarios
- Investment flow completion
- Mobile device testing

## Development Workflow

### Code Organization
```
frontend/
├── app/                          # Next.js App Router pages
├── components/
│   ├── web3/                    # Web3 integration components
│   ├── ui/                      # Reusable UI components
│   └── providers/               # Context providers
├── lib/
│   ├── web3/                    # Web3 configuration and hooks
│   ├── store/                   # State management
│   └── utils/                   # Utility functions
└── styles/                      # Global styles and themes
```

### Environment Configuration
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_DICO_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_DICO_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_api_key
```

## Deployment Considerations

### Build Optimization
- Static generation where possible
- API route optimization
- Image optimization with Next.js
- CDN configuration for assets

### Environment Management
- Separate configs for dev/staging/prod
- Secure environment variable handling
- Contract address management per network

## Future Enhancements

### Planned Features
1. **Advanced Portfolio Management**
   - Investment tracking and analytics
   - Performance visualization
   - Tax reporting tools

2. **Social Features**
   - Project discussion forums
   - Investor networking
   - Creator verification system

3. **Mobile App**
   - React Native implementation
   - Native wallet integrations
   - Push notification support

4. **Advanced Trading**
   - Secondary market integration
   - Order book functionality
   - Liquidity pool management

## Conclusion

The Dico Platform frontend has been architected with scalability, security, and user experience as primary concerns. The web3 integration provides a seamless experience for users while maintaining the highest standards of security and accessibility. The component-based architecture ensures maintainability and allows for rapid feature development while adhering to the established design system principles.

The implementation successfully bridges the gap between complex blockchain interactions and user-friendly interfaces, making decentralized ICO participation accessible to users of all technical levels while maintaining the transparency and security benefits of blockchain technology.