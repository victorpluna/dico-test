You should build the following project:

## 1. EXACT FEATURES & SCOPE DEFINITION

### Core Features (MVP - No additions allowed):

#### A. Project Creation Module
- **Project Submission Form** with fields for:
  - White Paper URL (IPFS link validation)
  - Project Plan URL (IPFS link validation)
  - Smart Contract Code (Solidity code editor with syntax highlighting)
  - Tokenomics display section
  - Own Funding amount (ETH input with minimum validation)
  - Target Funding amount (ETH input)
  - Funding Address (wallet address validation)
- **Project Preview** before submission
- **MetaMask integration** for wallet connection and ETH locking

#### B. Project Discovery Module
- **Active Projects Grid** displaying:
  - Project name and logo placeholder
  - Progress bar (current/target funding)
  - Time remaining (countdown)
  - Own funding amount
  - Quick stats (backers count, ETH raised)
- **Project Detail View** showing:
  - Full project information
  - Smart contract code viewer
  - Investment interface
  - Transaction history
  - Backer list (addresses and amounts)

#### C. Investment Module
- **Invest Modal** with:
  - ETH amount input
  - Gas fee estimation
  - Transaction confirmation
  - Success/error states
- **Investment tracking** per user

#### D. Claim/Apply Module
- **Claim Interface** (for failed projects):
  - Claim button for investors
  - Amount to claim display
  - Transaction status
- **Apply Interface** (for successful projects):
  - Apply button for creators only
  - Deployment status indicator
  - Transaction confirmation

#### E. User Dashboard
- **My Investments** tab showing:
  - Active investments
  - Claimable refunds
  - Investment history
- **My Projects** tab (for creators):
  - Created projects status
  - Apply button when applicable

### Tech Stack Confirmation:
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Web3**: ethers.js v6, wagmi, viem
- **State Management**: Zustand
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Storage**: IPFS for documents (using Pinata gateway)
- **UI Components**: shadcn/ui, Radix UI
- **Testing**: Hardhat for contracts, Jest for frontend

## 2. FILE STRUCTURE

```
dico-platform/
├── contracts/
│   ├── DicoFactory.sol           # Main ICO factory contract
│   ├── test/
│   │   └── DicoFactory.test.js
│   └── scripts/
│       └── deploy.js
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing/projects grid
│   │   ├── project/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Project detail view
│   │   │   └── create/
│   │   │       └── page.tsx      # Create project form
│   │   └── dashboard/
│   │       └── page.tsx          # User dashboard
│   │
│   ├── components/
│   │   ├── web3/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── InvestModal.tsx
│   │   │   └── ClaimButton.tsx
│   │   ├── project/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── CountdownTimer.tsx
│   │   └── ui/               # shadcn components
│   │
│   ├── lib/
│   │   ├── contracts/
│   │   │   ├── abi.json
│   │   │   └── addresses.ts
│   │   ├── web3/
│   │   │   ├── config.ts
│   │   │   └── hooks.ts
│   │   └── store/
│   │       └── projectStore.ts
│   │
│   └── styles/
│       └── globals.css
│
├── docs/
│   ├── ux-research/
│   │   ├── user-personas.md
│   │   ├── user-journeys.md
│   │   └── feature-requirements.md
│   ├── ui-design/
│   │   ├── design-system.md
│   │   ├── component-specs.md
│   │   └── animations.md
│   ├── frontend/
│   │   ├── component-architecture.md
│   │   └── state-management.md
│   └── backend/
│       ├── smart-contract-spec.md
│       └── deployment-guide.md
│
└── agent-handoff/
    ├── phase1-complete.json
    ├── phase2-complete.json
    ├── phase3-complete.json
    └── phase4-complete.json
```

## 3. INITIAL SETUP PROMPT

```bash
# Run this to initialize the project structure:

mkdir -p dico-platform/{contracts/{test,scripts},frontend/{app/{project/{id,create},dashboard},components/{web3,project,ui},lib/{contracts,web3,store},styles},docs/{ux-research,ui-design,frontend,backend},agent-handoff}

cd dico-platform

# Initialize Hardhat project
cd contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# Initialize Next.js frontend
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install ethers@6 wagmi viem @rainbow-me/rainbowkit zustand framer-motion
npx shadcn-ui@latest init
```

## 4. PHASE-BY-PHASE DEVELOPMENT WORKFLOW

### PHASE 1: UX & Planning (Day 1)

**Prompt:**
```
> First use the ux-researcher agent to conduct user research for a decentralized ICO platform. The agent must analyze three user personas: 1) Project Creators (entrepreneurs launching tokens), 2) Investors (crypto users seeking opportunities), and 3) Cautious Observers (users skeptical of ICOs). Map their complete journeys from discovery to post-investment/creation. Focus on trust signals, risk concerns, and decision points. Save all findings to docs/ux-research/user-personas.md and docs/ux-research/user-journeys.md.

> Then use the ux-researcher agent to define the exact information architecture and user flows for these specific features only: Project Creation Form (with 7 required fields), Active Projects Grid (with 5 data points per card), Project Detail View (with investment interface), Investment Modal (with gas estimation), Claim/Apply interfaces, and User Dashboard (with two tabs). Create wireframe descriptions focusing on element positioning, visual hierarchy, and interaction patterns. Save the complete feature requirements and wireframes to docs/ux-research/feature-requirements.md.

The agent must NOT add any features beyond whats specified. Focus on optimizing the existing feature set for trust, clarity, and ease of use.
```

### PHASE 2: UI Design (Day 2)

**Prompt:**
```
> First use the ui-designer agent to read the UX research from docs/ux-research/. Create a comprehensive design system for the Dico platform including: color palette (primary: electric blue #0066FF, success: green, warning: amber, error: red), typography scale (using Inter font), spacing system (8px base grid), and component tokens. The design must convey trust, transparency, and innovation while being implementable with Tailwind CSS. Save the design system to docs/ui-design/design-system.md.

> Then use the ui-designer agent to design all UI components based on the UX wireframes. Create detailed specifications for: ProjectCard (with glassmorphism effect and progress animation), InvestModal (with step-by-step flow), ProjectForm (multi-step with validation states), CountdownTimer (with urgency colors), and ProgressBar (with milestone markers). Include micro-interactions: hover states (scale and glow effects), loading states (skeleton screens), success animations (confetti for successful investment), and error states. All components must use only standard Tailwind classes and Framer Motion animations. Save component specifications to docs/ui-design/component-specs.md and animation details to docs/ui-design/animations.md.

Do not add any UI elements not mentioned in the UX requirements. Every design must be production-ready with exact Tailwind classes specified.
```

### PHASE 3: Frontend Development (Day 3-4)

**Prompt:**
```
> First use the frontend-developer agent to read the UI specifications from docs/ui-design/. Implement the core web3 integration components in frontend/components/web3/: WalletConnect.tsx (using RainbowKit with MetaMask, WalletConnect, Coinbase), InvestModal.tsx (with amount input, gas estimation using ethers.js, and transaction flow), and ClaimButton.tsx (with claim amount calculation and status tracking). Use wagmi hooks for wallet state and implement proper error handling. Save implementation notes to docs/frontend/component-architecture.md.

> Then use the frontend-developer agent to build the project components in frontend/components/project/: ProjectCard.tsx (with glassmorphism styling, animated progress bar, countdown timer), ProjectForm.tsx (multi-step form with Zod validation, IPFS link validation, Solidity code editor with syntax highlighting), ProgressBar.tsx (with animated fill and milestone markers), and CountdownTimer.tsx (with real-time updates and urgency states). Implement all micro-interactions from the UI design using Framer Motion. Create the main pages in frontend/app/: page.tsx (project grid with filtering), project/[id]/page.tsx (detail view with investment interface), project/create/page.tsx (creation form), and dashboard/page.tsx (tabbed interface). Set up Zustand store in frontend/lib/store/projectStore.ts for global state. Save state management patterns to docs/frontend/state-management.md.

Use only the components and features specified in the UI design. No additional features or pages should be created.
```

### PHASE 4: Backend Development (Day 5-6)

**Prompt:**
```
> First use the backend-architect agent to read all previous documentation from docs/. Design and implement the DicoFactory smart contract in contracts/DicoFactory.sol with these exact functions: createProject() (stores project data with validation for minimum own funding), getActiveProjects() (returns non-expired projects), investInProject() (handles ETH locking with investor tracking), claimRefund() (allows claiming when project fails), and applyProject() (deploys smart contract and transfers funds when target is met). Implement proper modifiers for access control, require statements for validation, and events for all state changes. The contract must handle the 3-month fixed deadline, track individual investments, and deploy new contracts from provided bytecode. Save the complete specification to docs/backend/smart-contract-spec.md.

> Then use the backend-architect agent to create comprehensive tests in contracts/test/DicoFactory.test.js covering: project creation scenarios, investment tracking, deadline enforcement, refund mechanisms, and contract deployment on apply. Write deployment script in contracts/scripts/deploy.js for testnet deployment. Update frontend/lib/contracts/ with ABI and contract addresses. Create integration hooks in frontend/lib/web3/hooks.ts for all contract functions. Document deployment process and gas optimization strategies in docs/backend/deployment-guide.md. Ensure all functions handle edge cases: zero amounts, deadline edge cases, reentrancy protection, and integer overflow prevention.

Implement only the specified contract functions. Do not add additional features like token distribution or governance mechanisms.
```

### PHASE HANDOFF DOCUMENTATION

Each phase completion should update `agent-handoff/phaseX-complete.json`:

```json
{
  "phase": 1,
  "completedBy": "ux-researcher",
  "timestamp": "2024-01-XX",
  "deliverables": [
    "docs/ux-research/user-personas.md",
    "docs/ux-research/user-journeys.md",
    "docs/ux-research/feature-requirements.md"
  ],
  "keyDecisions": {
    "trustSignals": "Show own funding prominently, display all investors",
    "userFlow": "Simplified 3-step investment process",
    "layout": "Grid view default, detailed modal for investments"
  },
  "nextPhaseRequirements": {
    "colorScheme": "Trust-focused blues and greens",
    "components": ["ProjectCard", "InvestModal", "ClaimButton"],
    "animations": "Smooth, professional, not flashy"
  }
}
```

## KEY CONSTRAINTS FOR ALL AGENTS:

1. **No Feature Creep**: Agents must ONLY implement the features listed in the scope
2. **File Discipline**: Always read from previous phases, save to designated locations
3. **Handoff Protocol**: Update phase completion JSON after each phase
4. **Quality Standards**: Every component must be production-ready, not a prototype
5. **Documentation**: Each agent must document their decisions and rationale

This workflow ensures a systematic, traceable development process where each agent builds upon the previous work without scope creep or miscommunication.