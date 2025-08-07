# Dico Platform Frontend

A Next.js 14 application with comprehensive web3 integration for decentralized ICO participation.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Web3 Components

### WalletConnect
Multi-wallet connection component supporting MetaMask, WalletConnect, and Coinbase Wallet.

**Usage:**
```tsx
import { WalletConnect } from '@/components/web3/WalletConnect'

// Default with balance display
<WalletConnect showBalance={true} />

// Compact version
<WalletConnect variant="compact" showBalance={false} />

// Minimal button
<WalletConnect variant="minimal" />
```

### InvestModal
3-step investment flow with ETH validation and gas estimation.

**Usage:**
```tsx
import { InvestModal } from '@/components/web3/InvestModal'

<InvestModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  projectAddress="0x..."
  projectName="Your Project"
  tokenSymbol="TOKEN"
  tokenPrice={0.001}
  vestingPeriod="12 months"
/>
```

### ClaimButton
Token claiming with vesting schedule visualization.

**Usage:**
```tsx
import { ClaimButton } from '@/components/web3/ClaimButton'

<ClaimButton
  projectAddress="0x..."
  claimableAmount="1000"
  tokenSymbol="TOKEN"
  vestingInfo={{
    totalAmount: "10000",
    claimedAmount: "3000",
    nextUnlock: new Date(),
    isVested: false,
  }}
/>
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_DICO_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_DICO_TOKEN_ADDRESS=0x...
```

## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4 with design system integration  
- **Web3**: wagmi + RainbowKit + ethers.js v6
- **Animations**: Framer Motion
- **Type Safety**: TypeScript with strict configuration

## Testing

To test the web3 components:

1. Connect your wallet (MetaMask, WalletConnect, etc.)
2. Try the investment modal flow
3. Test the claim functionality
4. Switch between different networks

## Development Notes

The application includes:
- ✅ Wallet connection with multiple providers
- ✅ Investment flow with gas estimation
- ✅ Token claiming with vesting support
- ✅ Responsive design with mobile optimization
- ✅ Accessibility compliance (WCAG AA)
- ✅ Error handling and user feedback
- ✅ Real-time transaction status tracking

## Component Documentation

For detailed component specifications and implementation notes, see:
`/docs/frontend/component-architecture.md`

## Learn More

To learn more about Next.js and the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [wagmi Documentation](https://wagmi.sh) - React hooks for Ethereum.
- [RainbowKit Documentation](https://www.rainbowkit.com) - wallet connection UI.
- [Tailwind CSS](https://tailwindcss.com) - utility-first CSS framework.
- [Framer Motion](https://www.framer.com/motion) - animation library.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.