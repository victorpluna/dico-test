# Dico Platform - Component Specifications

## Executive Summary

This document provides production-ready design specifications for 5 core UI components based on the UX wireframes and design system tokens. Each component includes exact layout dimensions, visual styling, interactive states, responsive behavior, and accessibility requirements using Tailwind CSS classes and Framer Motion animations.

---

## 1. ProjectCard Component

### Overview
A glassmorphism-styled card displaying project information with animated progress indicators, trust signals, and hover effects for the Active Projects Grid.

### Layout & Structure

#### Container Dimensions
```css
.project-card {
  @apply bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50
         p-6 transition-all duration-300
         hover:shadow-xl hover:border-blue-300/60 hover:scale-105
         cursor-pointer relative overflow-hidden;
}
```

#### Internal Layout
```html
<div class="project-card group">
  <!-- Glassmorphism Overlay -->
  <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
  
  <!-- Header Section -->
  <div class="flex items-center justify-between mb-4 relative z-10">
    <div class="flex items-center space-x-3">
      <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
        <div class="w-6 h-6 bg-blue-600 rounded opacity-80"></div>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">Project Name</h3>
    </div>
    <div class="flex items-center space-x-2">
      <span class="verified-badge">✓ Verified</span>
    </div>
  </div>
  
  <!-- Progress Section (Primary Prominence) -->
  <div class="space-y-3 mb-5 relative z-10">
    <div class="flex justify-between items-baseline">
      <span class="text-sm font-medium text-gray-700">Funding Progress</span>
      <span class="text-lg font-bold text-blue-600">65%</span>
    </div>
    
    <!-- Animated Progress Bar -->
    <div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div class="progress-fill-animated bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full relative"
           style="width: 65%">
        <!-- Progress Glow Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                    transform -skew-x-12 animate-shimmer"></div>
      </div>
      <!-- Milestone Markers -->
      <div class="absolute top-0 left-1/4 w-0.5 h-3 bg-gray-400 opacity-50"></div>
      <div class="absolute top-0 left-1/2 w-0.5 h-3 bg-gray-400 opacity-50"></div>
      <div class="absolute top-0 left-3/4 w-0.5 h-3 bg-gray-400 opacity-50"></div>
    </div>
    
    <!-- Funding Amounts -->
    <div class="flex justify-between text-sm">
      <span class="font-medium text-gray-900">325.5 ETH raised</span>
      <span class="text-gray-500">of 500 ETH target</span>
    </div>
  </div>
  
  <!-- Trust Signals Section -->
  <div class="space-y-3 mb-4 relative z-10">
    <!-- Own Funding (Skin in Game) -->
    <div class="flex items-center justify-between py-2 px-3 bg-green-50/80 rounded-lg">
      <span class="text-sm text-green-700 font-medium">Creator invested: 25 ETH</span>
      <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">5% skin-in-game</span>
    </div>
    
    <!-- Backer Count -->
    <div class="flex items-center space-x-4 text-sm text-gray-600">
      <span class="flex items-center space-x-1">
        <div class="w-4 h-4 bg-gray-300 rounded-full"></div>
        <span class="font-medium">127 backers</span>
      </span>
      <span class="flex items-center space-x-1">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Updated 2h ago</span>
      </span>
    </div>
  </div>
  
  <!-- Time Remaining (Urgency Colors) -->
  <div class="countdown-container relative z-10">
    <!-- Green: >30 days -->
    <div class="text-center py-3 px-4 bg-green-50/80 rounded-lg border border-green-200/50">
      <span class="text-sm font-semibold text-green-800">23d 14h 32m remaining</span>
      <div class="text-xs text-green-600 mt-1">Healthy timeline</div>
    </div>
  </div>
  
  <!-- Hover Glow Effect -->
  <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10
              animate-pulse-slow pointer-events-none"></div>
</div>
```

### Visual Design Specifications

#### Colors & Gradients
- **Card Background**: `bg-white/90` with `backdrop-blur-sm`
- **Glassmorphism Overlay**: `bg-gradient-to-br from-white/20 to-transparent`
- **Progress Bar**: `bg-gradient-to-r from-blue-500 to-blue-600`
- **Hover Glow**: `bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10`

#### Typography
- **Project Name**: `text-lg font-semibold text-gray-900`
- **Progress Percentage**: `text-lg font-bold text-blue-600`
- **ETH Amounts**: `text-sm font-medium text-gray-900`
- **Trust Signals**: `text-sm text-green-700 font-medium`

#### Spacing & Dimensions
- **Card Padding**: `p-6`
- **Section Spacing**: `mb-4`, `mb-5`
- **Internal Spacing**: `space-x-3`, `space-y-3`
- **Progress Bar Height**: `h-3`
- **Logo Placeholder**: `w-12 h-12`

### Interactive States

#### Hover State
```css
.project-card:hover {
  @apply shadow-xl border-blue-300/60 scale-105;
}

/* Hover Glow Animation */
.group:hover .hover-glow {
  @apply opacity-100;
}
```

#### Focus State (Keyboard Navigation)
```css
.project-card:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2;
}
```

#### Active State
```css
.project-card:active {
  @apply scale-100 shadow-lg;
}
```

### Micro-interactions

#### Progress Animation (Framer Motion)
```jsx
const progressVariants = {
  initial: { width: 0 },
  animate: { 
    width: `${progressPercentage}%`,
    transition: { duration: 1.2, ease: "easeOut", delay: 0.3 }
  }
}
```

#### Card Entrance Animation
```jsx
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" }
  }
}
```

#### Shimmer Effect Animation
```css
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(300%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

### Responsive Behavior

#### Mobile (320-768px)
```css
.project-card-mobile {
  @apply p-4;
}

.project-name-mobile {
  @apply text-base;
}

.progress-section-mobile {
  @apply space-y-2 mb-4;
}
```

#### Tablet (769-1024px)
```css
.project-card-tablet {
  @apply p-5;
}
```

#### Desktop (1025px+)
```css
.project-card-desktop {
  @apply p-6;
}
```

### Accessibility

#### ARIA Labels
```html
<div class="project-card" 
     role="button" 
     tabindex="0"
     aria-label="Project: DeFi Protocol, 65% funded, 23 days remaining"
     aria-describedby="project-details">
  
  <div role="progressbar" 
       aria-valuemin="0" 
       aria-valuemax="100" 
       aria-valuenow="65"
       aria-label="Funding progress: 65% of target reached">
  </div>
</div>
```

#### Keyboard Navigation
```css
.project-card {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2;
}
```

---

## 2. InvestModal Component

### Overview
A multi-step modal dialog for the investment flow with ETH input validation, gas estimation, and transaction confirmation states.

### Layout & Structure

#### Modal Container
```css
.invest-modal-overlay {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm z-50
         flex items-center justify-center p-4;
}

.invest-modal-content {
  @apply bg-white rounded-2xl shadow-2xl
         max-w-md w-full max-h-[90vh] overflow-y-auto
         transform transition-all duration-300;
}
```

#### Modal Structure
```html
<div class="invest-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="invest-modal-title">
  <div class="invest-modal-content">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <div class="w-5 h-5 bg-blue-600 rounded"></div>
        </div>
        <div>
          <h2 id="invest-modal-title" class="text-lg font-semibold text-gray-900">Invest in Project</h2>
          <p class="text-sm text-gray-500">Step 1 of 3: Set Investment Amount</p>
        </div>
      </div>
      <button class="modal-close-btn" aria-label="Close modal">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Step 1: Amount Input -->
    <div class="step-1-content p-6 space-y-6">
      <!-- ETH Amount Input -->
      <div class="space-y-3">
        <label for="eth-amount" class="block text-sm font-medium text-gray-700">
          Investment Amount
        </label>
        <div class="relative">
          <input 
            type="number" 
            id="eth-amount"
            placeholder="0.00"
            class="eth-amount-input"
            aria-describedby="eth-amount-help eth-amount-error"
            min="0.01"
            max="100"
            step="0.01"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="text-lg font-semibold text-gray-700">ETH</span>
          </div>
        </div>
        
        <!-- USD Conversion -->
        <div class="text-right">
          <span class="text-sm text-gray-500">≈ $3,240.00 USD</span>
        </div>
        
        <!-- Wallet Balance -->
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">Wallet Balance:</span>
          <span class="text-sm font-medium text-gray-900">12.5 ETH</span>
        </div>
        
        <!-- Quick Amount Buttons -->
        <div class="grid grid-cols-4 gap-2">
          <button class="quick-amount-btn">0.1 ETH</button>
          <button class="quick-amount-btn">0.5 ETH</button>
          <button class="quick-amount-btn">1 ETH</button>
          <button class="quick-amount-btn">Max</button>
        </div>
      </div>

      <!-- Gas Fee Estimation -->
      <div class="gas-estimation-section">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700">Network Fee</span>
          <button class="text-sm text-blue-600 hover:text-blue-700">Advanced</button>
        </div>
        
        <div class="space-y-2">
          <div class="gas-option active">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <input type="radio" name="gas" value="standard" checked class="text-blue-600">
                <span class="text-sm font-medium">Standard</span>
                <span class="text-xs text-gray-500">(~3 min)</span>
              </div>
              <span class="text-sm font-medium text-gray-900">0.004 ETH</span>
            </div>
          </div>
          
          <div class="gas-option">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <input type="radio" name="gas" value="fast" class="text-blue-600">
                <span class="text-sm font-medium">Fast</span>
                <span class="text-xs text-gray-500">(~1 min)</span>
              </div>
              <span class="text-sm font-medium text-gray-900">0.008 ETH</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Investment Summary -->
      <div class="investment-summary">
        <div class="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 class="text-sm font-medium text-blue-900">Investment Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-blue-700">Investment Amount:</span>
              <span class="font-medium text-blue-900">1.00 ETH</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700">Network Fee:</span>
              <span class="font-medium text-blue-900">0.004 ETH</span>
            </div>
            <div class="border-t border-blue-200 pt-2 flex justify-between">
              <span class="font-medium text-blue-900">Total:</span>
              <span class="font-bold text-blue-900">1.004 ETH</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="modal-footer">
      <div class="flex space-x-3 p-6 border-t border-gray-200">
        <button class="btn-secondary flex-1">Cancel</button>
        <button class="btn-primary flex-1" disabled>
          <span class="step-1-text">Review Investment</span>
          <span class="step-2-text hidden">Confirm Transaction</span>
          <span class="step-3-text hidden">Processing...</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

### Step-by-Step Flow States

#### Step 1: Amount Input
```css
.eth-amount-input {
  @apply w-full px-4 py-4 text-2xl font-semibold text-center
         border-2 border-gray-200 rounded-xl
         focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
         placeholder-gray-300 transition-colors duration-200;
}

.quick-amount-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100
         hover:bg-blue-100 hover:text-blue-700
         border border-gray-200 rounded-lg
         transition-colors duration-200;
}

.gas-option {
  @apply p-3 border border-gray-200 rounded-lg cursor-pointer
         hover:border-blue-300 hover:bg-blue-50/50
         transition-colors duration-200;
}

.gas-option.active {
  @apply border-blue-600 bg-blue-50;
}
```

#### Step 2: Gas Estimation & Confirmation
```html
<div class="step-2-content p-6 space-y-6">
  <!-- Transaction Preview -->
  <div class="transaction-preview">
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Review Your Investment</h3>
      
      <div class="space-y-4">
        <!-- Project Details -->
        <div class="flex items-center space-x-3 pb-3 border-b border-gray-200">
          <div class="w-12 h-12 bg-blue-100 rounded-lg"></div>
          <div>
            <h4 class="font-medium text-gray-900">DeFi Protocol Project</h4>
            <p class="text-sm text-gray-500">Verified Creator</p>
          </div>
        </div>
        
        <!-- Investment Details -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Your Investment:</span>
            <p class="font-semibold text-gray-900">1.00 ETH</p>
          </div>
          <div>
            <span class="text-gray-500">Expected Tokens:</span>
            <p class="font-semibold text-gray-900">1,000 DEFI</p>
          </div>
          <div>
            <span class="text-gray-500">Vesting Period:</span>
            <p class="font-semibold text-gray-900">12 months</p>
          </div>
          <div>
            <span class="text-gray-500">Network Fee:</span>
            <p class="font-semibold text-gray-900">0.004 ETH</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Risk Acknowledgment -->
  <div class="risk-acknowledgment space-y-4">
    <h3 class="text-sm font-medium text-gray-900">Risk Acknowledgment</h3>
    <div class="space-y-3">
      <label class="flex items-start space-x-3">
        <input type="checkbox" class="mt-1 text-blue-600 rounded" required>
        <span class="text-sm text-gray-600">
          I understand that cryptocurrency investments are high-risk and I may lose all invested funds.
        </span>
      </label>
      <label class="flex items-start space-x-3">
        <input type="checkbox" class="mt-1 text-blue-600 rounded" required>
        <span class="text-sm text-gray-600">
          I have read and agree to the <a href="#" class="text-blue-600 hover:text-blue-700">Terms of Service</a> and <a href="#" class="text-blue-600 hover:text-blue-700">Privacy Policy</a>.
        </span>
      </label>
    </div>
  </div>
</div>
```

#### Step 3: Processing State
```html
<div class="step-3-content p-6">
  <div class="text-center space-y-6">
    <!-- Processing Animation -->
    <div class="relative w-24 h-24 mx-auto">
      <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
      <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      <div class="absolute inset-4 bg-blue-100 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    </div>
    
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-gray-900">Processing Investment</h3>
      <p class="text-sm text-gray-600">Please confirm the transaction in your wallet</p>
    </div>
    
    <!-- Transaction Status -->
    <div class="bg-yellow-50 rounded-lg p-4 text-left">
      <div class="flex items-center space-x-2 mb-2">
        <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium text-yellow-800">Transaction Pending</span>
      </div>
      <p class="text-xs text-yellow-700 font-mono">TX: 0x1234...abcd</p>
      <a href="#" class="text-xs text-yellow-600 hover:text-yellow-700 underline">View on Etherscan</a>
    </div>
  </div>
</div>
```

### Success/Error States

#### Success State
```html
<div class="success-state p-6">
  <div class="text-center space-y-6">
    <!-- Success Animation -->
    <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <div class="space-y-2">
      <h3 class="text-xl font-bold text-green-900">Investment Successful!</h3>
      <p class="text-sm text-green-700">Your investment of 1.00 ETH has been confirmed</p>
    </div>
    
    <!-- Transaction Details -->
    <div class="bg-green-50 rounded-lg p-4 text-left space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-green-700">Transaction Hash:</span>
        <span class="font-mono text-green-900 text-xs">0x1234...abcd</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-green-700">Block Number:</span>
        <span class="text-green-900">18,547,392</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-green-700">Expected Tokens:</span>
        <span class="text-green-900 font-medium">1,000 DEFI</span>
      </div>
    </div>
    
    <button class="btn-primary w-full">View in Portfolio</button>
  </div>
</div>
```

#### Error State
```html
<div class="error-state p-6">
  <div class="text-center space-y-6">
    <!-- Error Animation -->
    <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    
    <div class="space-y-2">
      <h3 class="text-xl font-bold text-red-900">Transaction Failed</h3>
      <p class="text-sm text-red-700">Your investment could not be processed</p>
    </div>
    
    <!-- Error Details -->
    <div class="bg-red-50 rounded-lg p-4 text-left">
      <p class="text-sm text-red-800 mb-2">
        <span class="font-medium">Error:</span> Insufficient gas fee
      </p>
      <p class="text-xs text-red-600">
        The transaction failed due to network congestion. Please try again with a higher gas fee.
      </p>
    </div>
    
    <div class="flex space-x-3">
      <button class="btn-secondary flex-1">Cancel</button>
      <button class="btn-primary flex-1">Try Again</button>
    </div>
  </div>
</div>
```

### Validation States

#### ETH Amount Validation
```css
/* Valid State */
.eth-amount-input.valid {
  @apply border-green-500 bg-green-50/50;
}

/* Error State */
.eth-amount-input.error {
  @apply border-red-500 bg-red-50/50;
}

/* Loading State */
.eth-amount-input.loading {
  @apply border-blue-500 bg-blue-50/50;
}
```

#### Validation Messages
```html
<!-- Success Message -->
<div class="validation-message success">
  <div class="flex items-center space-x-2 text-sm text-green-700">
    <svg class="w-4 h-4" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span>Valid amount entered</span>
  </div>
</div>

<!-- Error Message -->
<div class="validation-message error">
  <div class="flex items-center space-x-2 text-sm text-red-700">
    <svg class="w-4 h-4" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
    </svg>
    <span>Amount exceeds wallet balance</span>
  </div>
</div>

<!-- Warning Message -->
<div class="validation-message warning">
  <div class="flex items-center space-x-2 text-sm text-amber-700">
    <svg class="w-4 h-4" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
    <span>High gas fees detected</span>
  </div>
</div>
```

### Responsive Behavior

#### Mobile (320-768px)
```css
.invest-modal-content-mobile {
  @apply max-w-full mx-4 max-h-[95vh];
}

.eth-amount-input-mobile {
  @apply text-xl px-3 py-3;
}

.modal-footer-mobile {
  @apply flex-col space-y-3 space-x-0;
}
```

#### Desktop (1025px+)
```css
.invest-modal-content-desktop {
  @apply max-w-lg;
}
```

### Accessibility

#### ARIA Labels & Descriptions
```html
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="invest-modal-title"
     aria-describedby="invest-modal-description">
  
  <input type="number" 
         aria-label="Investment amount in ETH"
         aria-describedby="eth-amount-help eth-amount-error"
         aria-invalid="false"
         aria-required="true" />
  
  <div role="progressbar" 
       aria-valuemin="1" 
       aria-valuemax="3" 
       aria-valuenow="1"
       aria-label="Investment process: step 1 of 3">
  </div>
</div>
```

#### Keyboard Navigation
```css
.modal-close-btn {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-full;
}

.invest-modal-content {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600;
}
```

---

## 3. ProjectForm Component

### Overview
A comprehensive multi-step form for project creation with 7 required fields, validation states, IPFS integration, and Solidity code editor.

### Layout & Structure

#### Form Container
```css
.project-form-container {
  @apply max-w-4xl mx-auto p-6 space-y-8;
}

.project-form-header {
  @apply text-center pb-8 border-b border-gray-200;
}

.project-form-progress {
  @apply w-full bg-gray-200 rounded-full h-2 mb-8;
}

.project-form-content {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-8;
}

.project-form-main {
  @apply lg:col-span-2 space-y-8;
}

.project-form-sidebar {
  @apply lg:col-span-1;
}
```

#### Form Structure
```html
<div class="project-form-container">
  <!-- Header & Progress -->
  <div class="project-form-header">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Your Project</h1>
    <p class="text-lg text-gray-600">Share your vision with the world</p>
    
    <!-- Progress Indicator -->
    <div class="project-form-progress">
      <div class="progress-fill bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 28%"></div>
    </div>
    
    <!-- Step Indicators -->
    <div class="flex justify-center space-x-4 mt-4">
      <div class="step-indicator active">
        <div class="step-circle">1</div>
        <span class="step-label">Documentation</span>
      </div>
      <div class="step-indicator">
        <div class="step-circle">2</div>
        <span class="step-label">Technical</span>
      </div>
      <div class="step-indicator">
        <div class="step-circle">3</div>
        <span class="step-label">Economics</span>
      </div>
      <div class="step-indicator">
        <div class="step-circle">4</div>
        <span class="step-label">Funding</span>
      </div>
      <div class="step-indicator">
        <div class="step-circle">5</div>
        <span class="step-label">Review</span>
      </div>
    </div>
  </div>

  <div class="project-form-content">
    <!-- Main Form -->
    <div class="project-form-main">
      <!-- Step 1: Project Documentation -->
      <div class="form-section active" data-step="1">
        <h2 class="section-title">Project Documentation</h2>
        <p class="section-description">Provide essential documents that establish trust and credibility</p>
        
        <div class="form-fields space-y-6">
          <!-- White Paper URL -->
          <div class="form-field-group">
            <label for="whitepaper-url" class="form-label required">
              White Paper URL
              <span class="field-help">IPFS link to your project white paper</span>
            </label>
            <div class="ipfs-input-container">
              <input 
                type="url" 
                id="whitepaper-url"
                name="whitepaperUrl"
                placeholder="ipfs://QmYourWhitepaperHash"
                class="form-input ipfs-input"
                aria-describedby="whitepaper-help whitepaper-error"
                pattern="^ipfs://.*"
                required
              />
              
              <!-- Validation Indicator -->
              <div class="validation-indicator">
                <div class="validation-spinner hidden">
                  <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <div class="validation-success hidden">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="validation-error hidden">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Help Text -->
            <div id="whitepaper-help" class="field-help-text">
              Upload your white paper to IPFS and paste the link here. We'll validate the document automatically.
            </div>
            
            <!-- IPFS Preview -->
            <div class="ipfs-preview hidden">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-green-900">White Paper Verified</p>
                    <p class="text-xs text-green-700">PDF • 2.4 MB • 24 pages</p>
                  </div>
                  <a href="#" class="text-sm text-green-600 hover:text-green-700 font-medium">Preview</a>
                </div>
              </div>
            </div>
            
            <!-- Error State -->
            <div id="whitepaper-error" class="field-error hidden">
              <div class="flex items-center space-x-2 text-sm text-red-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                </svg>
                <span>Unable to access IPFS document. Please check the URL.</span>
              </div>
            </div>
          </div>

          <!-- Project Plan URL -->
          <div class="form-field-group">
            <label for="project-plan-url" class="form-label required">
              Project Plan URL
              <span class="field-help">IPFS link to your detailed project roadmap</span>
            </label>
            <div class="ipfs-input-container">
              <input 
                type="url" 
                id="project-plan-url"
                name="projectPlanUrl"
                placeholder="ipfs://QmYourProjectPlanHash"
                class="form-input ipfs-input"
                pattern="^ipfs://.*"
                required
              />
              <div class="validation-indicator">
                <div class="validation-spinner hidden">
                  <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <div class="validation-success hidden">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Technical Implementation -->
      <div class="form-section" data-step="2">
        <h2 class="section-title">Technical Implementation</h2>
        <p class="section-description">Provide your smart contract code and technical specifications</p>
        
        <div class="form-fields space-y-6">
          <!-- Smart Contract Code -->
          <div class="form-field-group">
            <label for="smart-contract-code" class="form-label required">
              Smart Contract Code
              <span class="field-help">Solidity code for your token contract</span>
            </label>
            
            <!-- Code Editor Container -->
            <div class="code-editor-container">
              <div class="code-editor-header">
                <div class="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-gray-700">contract.sol</span>
                    <div class="compilation-status">
                      <span class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <div class="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                        Not compiled
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="template-btn">Templates</button>
                    <button class="compile-btn">Compile</button>
                    <button class="fullscreen-btn">Fullscreen</button>
                  </div>
                </div>
              </div>
              
              <div class="code-editor-content">
                <textarea 
                  id="smart-contract-code"
                  name="smartContractCode"
                  class="code-editor-textarea"
                  placeholder="pragma solidity ^0.8.0;

contract YourToken {
    // Your smart contract code here
}"
                  rows="20"
                  required
                ></textarea>
              </div>
              
              <!-- Syntax Highlighting Overlay -->
              <div class="syntax-highlight-overlay"></div>
              
              <!-- Line Numbers -->
              <div class="line-numbers">
                <div class="line-number">1</div>
                <div class="line-number">2</div>
                <div class="line-number">3</div>
                <div class="line-number">4</div>
                <div class="line-number">5</div>
              </div>
            </div>
            
            <!-- Code Editor Actions -->
            <div class="code-editor-actions">
              <div class="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200">
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Lines: 24</span>
                  <span>Characters: 1,247</span>
                  <span>Solidity ^0.8.0</span>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="format-btn">Format Code</button>
                  <button class="audit-btn">Security Audit</button>
                </div>
              </div>
            </div>
            
            <!-- Compilation Results -->
            <div class="compilation-results hidden">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm font-medium text-green-900">Compilation Successful</span>
                </div>
                <div class="text-xs text-green-700 space-y-1">
                  <p>Contract size: 4.2 KB</p>
                  <p>Gas estimate: 1,247,832</p>
                  <p>Optimization: Enabled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Economic Model -->
      <div class="form-section" data-step="3">
        <h2 class="section-title">Economic Model</h2>
        <p class="section-description">Define your tokenomics and economic structure</p>
        
        <!-- Tokenomics Visualization -->
        <div class="tokenomics-section">
          <div class="tokenomics-chart-container">
            <!-- Interactive pie chart would go here -->
            <div class="tokenomics-chart">
              <canvas id="tokenomics-chart" width="300" height="300"></canvas>
            </div>
            <div class="tokenomics-legend">
              <div class="legend-item">
                <div class="legend-color bg-blue-500"></div>
                <span class="legend-label">Public Sale (40%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-green-500"></div>
                <span class="legend-label">Team (20%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-purple-500"></div>
                <span class="legend-label">Development (25%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-orange-500"></div>
                <span class="legend-label">Marketing (10%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-red-500"></div>
                <span class="legend-label">Reserve (5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Funding Structure -->
      <div class="form-section" data-step="4">
        <h2 class="section-title">Funding Structure</h2>
        <p class="section-description">Set your funding goals and demonstrate commitment</p>
        
        <div class="form-fields space-y-6">
          <!-- Own Funding Amount -->
          <div class="form-field-group">
            <label for="own-funding" class="form-label required">
              Your Own Funding (ETH)
              <span class="field-help">Amount you'll invest in your own project</span>
            </label>
            <div class="eth-input-container">
              <input 
                type="number" 
                id="own-funding"
                name="ownFunding"
                placeholder="0.00"
                class="form-input eth-input"
                min="0.1"
                step="0.01"
                required
              />
              <div class="input-suffix">ETH</div>
            </div>
            
            <!-- Skin-in-game Indicator -->
            <div class="skin-in-game-indicator">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="text-sm text-blue-700">Skin-in-game percentage:</span>
                <span class="text-sm font-bold text-blue-900">12%</span>
              </div>
              <div class="text-xs text-blue-600 mt-1">
                Shows investors your commitment to the project's success
              </div>
            </div>
          </div>

          <!-- Target Funding Amount -->
          <div class="form-field-group">
            <label for="target-funding" class="form-label required">
              Target Funding Amount (ETH)
              <span class="field-help">Total amount you want to raise</span>
            </label>
            <div class="eth-input-container">
              <input 
                type="number" 
                id="target-funding"
                name="targetFunding"
                placeholder="0.00"
                class="form-input eth-input"
                min="1"
                step="0.01"
                required
              />
              <div class="input-suffix">ETH</div>
            </div>
            
            <!-- Market Context -->
            <div class="market-context">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-900 mb-2">Market Context</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Similar projects avg:</span>
                    <span class="font-medium text-gray-900">150 ETH</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Success rate at this level:</span>
                    <span class="font-medium text-green-600">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Funding Address -->
          <div class="form-field-group">
            <label for="funding-address" class="form-label required">
              Funding Address
              <span class="field-help">Ethereum address that will receive funds</span>
            </label>
            <div class="address-input-container">
              <input 
                type="text" 
                id="funding-address"
                name="fundingAddress"
                placeholder="0x..."
                class="form-input address-input font-mono"
                pattern="^0x[a-fA-F0-9]{40}$"
                required
              />
              <button type="button" class="connect-wallet-btn">
                Connect Wallet
              </button>
            </div>
            
            <!-- ENS Support -->
            <div class="ens-support">
              <div class="text-xs text-gray-500 mb-2">
                Supports ENS names (e.g., yourname.eth)
              </div>
            </div>
            
            <!-- Multi-sig Recommendation -->
            <div class="multisig-recommendation">
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div class="flex items-start space-x-2">
                  <svg class="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm">
                    <p class="font-medium text-amber-900 mb-1">Multi-signature Recommended</p>
                    <p class="text-amber-700">Consider using a multi-sig wallet for enhanced security and trust.</p>
                    <a href="#" class="text-amber-600 hover:text-amber-700 font-medium">Learn more</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Preview & Review -->
      <div class="form-section" data-step="5">
        <h2 class="section-title">Preview & Review</h2>
        <p class="section-description">Review your project before submission</p>
        
        <!-- Project Preview -->
        <div class="project-preview">
          <div class="preview-card">
            <div class="preview-header">
              <h3 class="text-lg font-semibold text-gray-900">Project Preview</h3>
              <p class="text-sm text-gray-600">This is how your project will appear to investors</p>
            </div>
            
            <!-- Live Preview of ProjectCard -->
            <div class="preview-content">
              <!-- This would render the actual ProjectCard component -->
              <div class="project-card-preview">
                <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-gray-900">Your Project Name</h4>
                    <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Draft
                    </span>
                  </div>
                  <div class="space-y-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>0 ETH raised</span>
                      <span>of 100 ETH target</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="project-form-sidebar">
      <!-- Auto-save Status -->
      <div class="autosave-status">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
            <span class="text-sm font-medium text-gray-900">Auto-saved</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Last saved 2 minutes ago</p>
        </div>
      </div>

      <!-- Progress Summary -->
      <div class="progress-summary">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Progress Summary</h3>
          <div class="space-y-2">
            <div class="progress-item completed">
              <span class="text-sm text-green-700">✓ Documentation</span>
            </div>
            <div class="progress-item completed">
              <span class="text-sm text-green-700">✓ Technical Details</span>
            </div>
            <div class="progress-item current">
              <span class="text-sm text-blue-700">→ Economics</span>
            </div>
            <div class="progress-item pending">
              <span class="text-sm text-gray-500">○ Funding</span>
            </div>
            <div class="progress-item pending">
              <span class="text-sm text-gray-500">○ Review</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Help & Support -->
      <div class="help-support">
        <div class="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 class="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
          <p class="text-xs text-blue-700 mb-3">
            Our support team is here to help you create a successful project.
          </p>
          <div class="space-y-2">
            <a href="#" class="block text-xs text-blue-600 hover:text-blue-700 font-medium">
              Project Creation Guide
            </a>
            <a href="#" class="block text-xs text-blue-600 hover:text-blue-700 font-medium">
              Smart Contract Templates
            </a>
            <a href="#" class="block text-xs text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Panel (Fixed Bottom) -->
  <div class="action-panel">
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Step 3 of 5</span>
          <span class="text-sm text-gray-400">•</span>
          <span class="text-sm text-green-600 font-medium">Auto-saved</span>
        </div>
        
        <div class="flex items-center space-x-3">
          <button class="btn-secondary">Save Draft</button>
          <button class="btn-secondary" disabled>← Previous</button>
          <button class="btn-primary">Next →</button>
          <button class="btn-success hidden" id="submit-btn">Submit Project</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Form Field Styling

#### Base Input Styles
```css
.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
         placeholder-gray-400 text-gray-900 text-base
         focus:ring-2 focus:ring-blue-600 focus:border-blue-600
         disabled:bg-gray-50 disabled:text-gray-400
         transition-colors duration-200;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-label.required::after {
  content: '*';
  @apply text-red-500 ml-1;
}

.field-help {
  @apply block text-xs text-gray-500 font-normal;
}

.field-help-text {
  @apply text-xs text-gray-500 mt-1;
}

.form-field-group {
  @apply space-y-2;
}
```

#### Specialized Input Types
```css
.ipfs-input-container {
  @apply relative;
}

.ipfs-input {
  @apply pr-12 font-mono text-sm;
}

.validation-indicator {
  @apply absolute inset-y-0 right-0 flex items-center pr-3;
}

.eth-input-container {
  @apply relative;
}

.eth-input {
  @apply pr-16 text-right text-lg font-semibold;
}

.input-suffix {
  @apply absolute inset-y-0 right-0 flex items-center pr-4 
         text-gray-500 font-medium pointer-events-none;
}

.address-input-container {
  @apply flex space-x-3;
}

.address-input {
  @apply flex-1 text-sm;
}

.connect-wallet-btn {
  @apply px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
         hover:bg-blue-700 transition-colors duration-200;
}
```

#### Code Editor Styling
```css
.code-editor-container {
  @apply border border-gray-300 rounded-lg overflow-hidden
         focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600;
}

.code-editor-header {
  @apply bg-gray-50 border-b border-gray-200;
}

.template-btn,
.compile-btn,
.fullscreen-btn {
  @apply px-3 py-1 text-xs font-medium text-gray-600 
         hover:text-gray-900 hover:bg-gray-100 rounded;
}

.code-editor-content {
  @apply relative;
}

.code-editor-textarea {
  @apply w-full p-4 font-mono text-sm leading-relaxed
         resize-none border-none outline-none
         placeholder-gray-400 text-gray-900;
}

.line-numbers {
  @apply absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200
         flex flex-col text-xs text-gray-500 font-mono pt-4;
}

.line-number {
  @apply h-6 flex items-center justify-end pr-2;
}

.syntax-highlight-overlay {
  @apply absolute inset-0 pointer-events-none;
}
```

### Validation States

#### Field Validation Classes
```css
.form-input.valid {
  @apply border-green-500 bg-green-50/30 focus:ring-green-600 focus:border-green-600;
}

.form-input.error {
  @apply border-red-500 bg-red-50/30 focus:ring-red-600 focus:border-red-600;
}

.form-input.loading {
  @apply border-blue-500 bg-blue-50/30;
}

.field-error {
  @apply mt-1;
}
```

#### Validation Messages
```css
.validation-message {
  @apply flex items-center space-x-2 text-sm;
}

.validation-message.success {
  @apply text-green-700;
}

.validation-message.error {
  @apply text-red-700;
}

.validation-message.warning {
  @apply text-amber-700;
}
```

### Step Navigation

#### Step Indicators
```css
.step-indicator {
  @apply flex flex-col items-center space-y-2;
}

.step-circle {
  @apply w-8 h-8 rounded-full border-2 border-gray-300
         flex items-center justify-center text-sm font-medium text-gray-500
         transition-colors duration-200;
}

.step-indicator.active .step-circle {
  @apply border-blue-600 bg-blue-600 text-white;
}

.step-indicator.completed .step-circle {
  @apply border-green-600 bg-green-600 text-white;
}

.step-label {
  @apply text-xs font-medium text-gray-500;
}

.step-indicator.active .step-label {
  @apply text-blue-600;
}

.step-indicator.completed .step-label {
  @apply text-green-600;
}
```

#### Form Section States
```css
.form-section {
  @apply hidden;
}

.form-section.active {
  @apply block;
}

.section-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.section-description {
  @apply text-sm text-gray-600 mb-6;
}
```

### Responsive Behavior

#### Mobile (320-768px)
```css
.project-form-content-mobile {
  @apply grid-cols-1 gap-6;
}

.project-form-sidebar-mobile {
  @apply order-first;
}

.action-panel-mobile {
  @apply px-4 py-3;
}

.action-panel-mobile .flex {
  @apply flex-col space-y-3 space-x-0;
}
```

#### Tablet (769-1024px)
```css
.project-form-content-tablet {
  @apply grid-cols-1 gap-8;
}
```

### Accessibility

#### ARIA Labels & Structure
```html
<form role="form" aria-labelledby="project-form-title">
  <fieldset>
    <legend class="sr-only">Project Documentation</legend>
    
    <label for="whitepaper-url">
      White Paper URL
      <span aria-hidden="true">*</span>
    </label>
    <input 
      type="url"
      id="whitepaper-url"
      aria-describedby="whitepaper-help whitepaper-error"
      aria-required="true"
      aria-invalid="false"
    />
    <div id="whitepaper-help">Upload your white paper to IPFS and paste the link here.</div>
    <div id="whitepaper-error" role="alert" class="hidden"></div>
  </fieldset>
</form>

<div role="progressbar" 
     aria-valuemin="0" 
     aria-valuemax="5" 
     aria-valuenow="2"
     aria-label="Form progress: step 2 of 5 completed">
</div>
```

#### Keyboard Navigation
```css
.form-input:focus {
  @apply ring-2 ring-blue-600 border-blue-600;
}

.code-editor-textarea:focus {
  @apply ring-2 ring-blue-600;
}

.step-indicator:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2 rounded-full;
}
```

---

## 4. CountdownTimer Component

### Overview
A real-time countdown timer with urgency-based color coding and responsive sizing for different contexts.

### Layout & Structure

#### Timer Container
```css
.countdown-timer {
  @apply inline-flex items-center justify-center space-x-2
         px-4 py-2 rounded-lg font-medium transition-colors duration-300;
}

.countdown-timer.large {
  @apply px-6 py-3 text-lg space-x-3;
}

.countdown-timer.small {
  @apply px-3 py-1 text-sm space-x-1;
}
```

#### Timer Structure
```html
<div class="countdown-timer" data-urgency="healthy">
  <!-- Timer Segments -->
  <div class="timer-segment">
    <span class="timer-value">23</span>
    <span class="timer-unit">d</span>
  </div>
  
  <div class="timer-separator">:</div>
  
  <div class="timer-segment">
    <span class="timer-value">14</span>
    <span class="timer-unit">h</span>
  </div>
  
  <div class="timer-separator">:</div>
  
  <div class="timer-segment">
    <span class="timer-value">32</span>
    <span class="timer-unit">m</span>
  </div>
  
  <!-- Urgency Indicator -->
  <div class="urgency-indicator">
    <div class="urgency-dot"></div>
    <span class="urgency-label">Healthy timeline</span>
  </div>
</div>

<!-- Alternative Block Format -->
<div class="countdown-timer-block">
  <div class="timer-header">
    <span class="timer-title">Time Remaining</span>
    <div class="urgency-badge healthy">
      <div class="urgency-dot"></div>
      <span>Healthy</span>
    </div>
  </div>
  
  <div class="timer-display">
    <div class="timer-block">
      <div class="timer-number">23</div>
      <div class="timer-label">Days</div>
    </div>
    <div class="timer-block">
      <div class="timer-number">14</div>
      <div class="timer-label">Hours</div>
    </div>
    <div class="timer-block">
      <div class="timer-number">32</div>
      <div class="timer-label">Minutes</div>
    </div>
  </div>
  
  <div class="timer-progress">
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: 65%"></div>
    </div>
    <div class="progress-labels">
      <span class="progress-start">Started</span>
      <span class="progress-end">Deadline</span>
    </div>
  </div>
</div>
```

### Urgency Color Coding

#### Green State (>30 days remaining)
```css
.countdown-timer[data-urgency="healthy"] {
  @apply bg-green-50 text-green-800 border border-green-200;
}

.countdown-timer[data-urgency="healthy"] .urgency-dot {
  @apply bg-green-400;
}

.countdown-timer[data-urgency="healthy"] .urgency-label {
  @apply text-green-700;
}

/* Block format */
.urgency-badge.healthy {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.timer-number.healthy {
  @apply text-green-600;
}
```

#### Amber State (7-30 days remaining)
```css
.countdown-timer[data-urgency="warning"] {
  @apply bg-amber-50 text-amber-800 border border-amber-200;
}

.countdown-timer[data-urgency="warning"] .urgency-dot {
  @apply bg-amber-400 animate-pulse;
}

.countdown-timer[data-urgency="warning"] .urgency-label {
  @apply text-amber-700;
}

/* Block format */
.urgency-badge.warning {
  @apply bg-amber-100 text-amber-800 border border-amber-200;
}

.timer-number.warning {
  @apply text-amber-600;
}
```

#### Red State (<7 days remaining)
```css
.countdown-timer[data-urgency="critical"] {
  @apply bg-red-50 text-red-800 border border-red-200;
}

.countdown-timer[data-urgency="critical"] .urgency-dot {
  @apply bg-red-400 animate-ping;
}

.countdown-timer[data-urgency="critical"] .urgency-label {
  @apply text-red-700;
}

/* Block format */
.urgency-badge.critical {
  @apply bg-red-100 text-red-800 border border-red-200;
}

.timer-number.critical {
  @apply text-red-600;
}

/* Urgent animation */
.countdown-timer[data-urgency="critical"] {
  animation: urgentPulse 2s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

### Component Styling

#### Timer Elements
```css
.timer-segment {
  @apply flex items-baseline space-x-1;
}

.timer-value {
  @apply text-2xl font-bold tabular-nums;
}

.timer-unit {
  @apply text-sm font-medium opacity-75;
}

.timer-separator {
  @apply text-xl font-bold opacity-50;
}

.urgency-indicator {
  @apply flex items-center space-x-2 ml-3;
}

.urgency-dot {
  @apply w-2 h-2 rounded-full;
}

.urgency-label {
  @apply text-xs font-medium;
}
```

#### Block Format Styling
```css
.countdown-timer-block {
  @apply bg-white rounded-xl border border-gray-200 p-6 space-y-4;
}

.timer-header {
  @apply flex items-center justify-between;
}

.timer-title {
  @apply text-sm font-medium text-gray-700;
}

.urgency-badge {
  @apply inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium;
}

.timer-display {
  @apply grid grid-cols-3 gap-4;
}

.timer-block {
  @apply text-center;
}

.timer-number {
  @apply text-3xl font-bold tabular-nums;
}

.timer-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.timer-progress {
  @apply space-y-2;
}

.progress-bar-bg {
  @apply w-full bg-gray-200 rounded-full h-1;
}

.progress-bar-fill {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-300;
}

.progress-labels {
  @apply flex justify-between text-xs text-gray-500;
}
```

### Size Variants

#### Large Size (Hero sections)
```css
.countdown-timer.large .timer-value {
  @apply text-4xl;
}

.countdown-timer.large .timer-unit {
  @apply text-base;
}

.countdown-timer.large .timer-separator {
  @apply text-3xl;
}

.countdown-timer.large .urgency-label {
  @apply text-sm;
}
```

#### Small Size (Card contexts)
```css
.countdown-timer.small .timer-value {
  @apply text-lg;
}

.countdown-timer.small .timer-unit {
  @apply text-xs;
}

.countdown-timer.small .timer-separator {
  @apply text-base;
}

.countdown-timer.small .urgency-label {
  @apply text-xs;
}
```

#### Compact Variant
```css
.countdown-timer-compact {
  @apply inline-flex items-center space-x-1 text-sm font-semibold;
}

.countdown-timer-compact .timer-segment {
  @apply space-x-0;
}

.countdown-timer-compact .timer-value {
  @apply text-sm;
}

.countdown-timer-compact .timer-unit {
  @apply text-xs opacity-75;
}
```

### Real-time Update Animation

#### Number Flip Animation
```css
.timer-value {
  @apply relative overflow-hidden;
}

.timer-value-new {
  @apply absolute inset-0 flex items-center justify-center
         transform translate-y-full;
  animation: flipIn 0.6s ease-out forwards;
}

.timer-value-old {
  animation: flipOut 0.6s ease-out forwards;
}

@keyframes flipIn {
  0% {
    transform: rotateX(90deg) translateY(-50%);
    opacity: 0;
  }
  50% {
    transform: rotateX(45deg) translateY(-25%);
    opacity: 0.5;
  }
  100% {
    transform: rotateX(0deg) translateY(0%);
    opacity: 1;
  }
}

@keyframes flipOut {
  0% {
    transform: rotateX(0deg) translateY(0%);
    opacity: 1;
  }
  50% {
    transform: rotateX(-45deg) translateY(25%);
    opacity: 0.5;
  }
  100% {
    transform: rotateX(-90deg) translateY(50%);
    opacity: 0;
  }
}
```

#### Urgency Transition Animation
```css
.countdown-timer {
  transition: all 0.5s ease-in-out;
}

.countdown-timer.transitioning {
  animation: colorTransition 1s ease-in-out;
}

@keyframes colorTransition {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Responsive Behavior

#### Mobile (320-768px)
```css
.countdown-timer-mobile {
  @apply text-sm space-x-1;
}

.countdown-timer-mobile .timer-value {
  @apply text-lg;
}

.countdown-timer-mobile .urgency-label {
  @apply hidden;
}

.countdown-timer-block-mobile {
  @apply p-4;
}

.countdown-timer-block-mobile .timer-display {
  @apply grid-cols-3 gap-2;
}

.countdown-timer-block-mobile .timer-number {
  @apply text-2xl;
}
```

#### Tablet (769-1024px)
```css
.countdown-timer-tablet .timer-value {
  @apply text-xl;
}

.countdown-timer-block-tablet {
  @apply p-5;
}
```

### Micro-interactions

#### Hover Effects
```css
.countdown-timer:hover {
  @apply transform -translate-y-0.5 shadow-lg;
  transition: all 0.2s ease-out;
}

.countdown-timer-block:hover {
  @apply shadow-md border-gray-300;
}

.countdown-timer-block:hover .timer-number {
  @apply scale-105;
  transition: transform 0.2s ease-out;
}
```

#### Focus States
```css
.countdown-timer:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2;
}

.countdown-timer-block:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2;
}
```

### Accessibility

#### ARIA Labels
```html
<div class="countdown-timer" 
     role="timer"
     aria-label="Time remaining: 23 days, 14 hours, 32 minutes"
     aria-live="polite"
     aria-atomic="true">
  
  <time datetime="P23DT14H32M">
    <span aria-label="23 days">23d</span>
    <span aria-label="14 hours">14h</span>
    <span aria-label="32 minutes">32m</span>
  </time>
  
  <span class="urgency-indicator" aria-label="Timeline status: healthy">
    <span class="urgency-dot" aria-hidden="true"></span>
    <span class="urgency-label">Healthy timeline</span>
  </span>
</div>
```

#### Screen Reader Considerations
```css
.sr-only-countdown {
  @apply sr-only;
}

/* Announce significant time changes */
.countdown-timer[data-announce="true"] {
  /* JavaScript will use aria-live region for updates */
}
```

---

## 5. ProgressBar Component

### Overview
An animated progress bar with milestone markers, funding visualization, and transparency features for displaying project funding status.

### Layout & Structure

#### Basic Progress Bar
```css
.progress-bar-container {
  @apply space-y-3;
}

.progress-bar-header {
  @apply flex items-center justify-between;
}

.progress-bar-wrapper {
  @apply relative w-full bg-gray-200 rounded-full h-3 overflow-hidden;
}

.progress-bar-fill {
  @apply h-3 rounded-full transition-all duration-1000 ease-out relative;
}

.progress-bar-footer {
  @apply flex items-center justify-between text-sm;
}
```

#### Complete Progress Component
```html
<div class="progress-bar-container">
  <!-- Header with Labels -->
  <div class="progress-bar-header">
    <div class="flex items-center space-x-2">
      <h3 class="text-sm font-medium text-gray-700">Funding Progress</h3>
      <div class="progress-status-badge success">
        <div class="status-dot"></div>
        <span class="status-text">On Track</span>
      </div>
    </div>
    <div class="progress-percentage">
      <span class="text-2xl font-bold text-blue-600">65%</span>
    </div>
  </div>

  <!-- Main Progress Bar -->
  <div class="progress-bar-wrapper">
    <!-- Background Track -->
    <div class="progress-track"></div>
    
    <!-- Animated Fill -->
    <div class="progress-bar-fill bg-gradient-to-r from-blue-500 to-blue-600" 
         style="width: 65%"
         data-progress="65">
      
      <!-- Shimmer Effect -->
      <div class="progress-shimmer"></div>
      
      <!-- Progress Glow -->
      <div class="progress-glow"></div>
    </div>
    
    <!-- Milestone Markers -->
    <div class="milestone-markers">
      <div class="milestone-marker completed" style="left: 25%" data-milestone="25%">
        <div class="marker-dot"></div>
        <div class="marker-tooltip">
          <span class="tooltip-text">25% Milestone</span>
          <div class="tooltip-arrow"></div>
        </div>
      </div>
      
      <div class="milestone-marker completed" style="left: 50%" data-milestone="50%">
        <div class="marker-dot"></div>
        <div class="marker-tooltip">
          <span class="tooltip-text">50% Milestone</span>
          <div class="tooltip-arrow"></div>
        </div>
      </div>
      
      <div class="milestone-marker pending" style="left: 75%" data-milestone="75%">
        <div class="marker-dot"></div>
        <div class="marker-tooltip">
          <span class="tooltip-text">75% Milestone</span>
          <div class="tooltip-arrow"></div>
        </div>
      </div>
    </div>
    
    <!-- Target Line -->
    <div class="target-line" style="left: 100%">
      <div class="target-marker"></div>
    </div>
  </div>

  <!-- Funding Details -->
  <div class="progress-bar-footer">
    <div class="funding-current">
      <span class="amount-label">Raised:</span>
      <span class="amount-value">325.5 ETH</span>
      <span class="amount-usd">($1,142,250)</span>
    </div>
    <div class="funding-target">
      <span class="amount-label">Target:</span>
      <span class="amount-value">500 ETH</span>
      <span class="amount-usd">($1,750,000)</span>
    </div>
  </div>

  <!-- Trust Transparency Features -->
  <div class="progress-transparency">
    <div class="transparency-grid">
      <div class="transparency-item">
        <div class="transparency-icon">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="transparency-content">
          <span class="transparency-label">Verified Funds</span>
          <span class="transparency-value">325.5 ETH</span>
        </div>
      </div>
      
      <div class="transparency-item">
        <div class="transparency-icon">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="transparency-content">
          <span class="transparency-label">Creator Stake</span>
          <span class="transparency-value">25 ETH (5%)</span>
        </div>
      </div>
      
      <div class="transparency-item">
        <div class="transparency-icon">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div class="transparency-content">
          <span class="transparency-label">Backers</span>
          <span class="transparency-value">127 investors</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Live Updates -->
  <div class="progress-updates">
    <div class="update-indicator">
      <div class="update-pulse"></div>
      <span class="update-text">Last updated 2 minutes ago</span>
      <a href="#" class="update-link">View transactions</a>
    </div>
  </div>
</div>
```

### Visual Design Specifications

#### Progress Bar Styling
```css
.progress-track {
  @apply absolute inset-0 bg-gray-200 rounded-full;
}

.progress-bar-fill {
  @apply relative bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full
         shadow-sm transition-all duration-1000 ease-out;
}

.progress-shimmer {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
         transform -skew-x-12 opacity-60;
  animation: shimmer 2s ease-in-out infinite;
}

.progress-glow {
  @apply absolute inset-0 bg-gradient-to-r from-blue-400/50 to-blue-500/50
         rounded-full blur-sm opacity-75;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(300%) skewX(-12deg); }
}
```

#### Milestone Markers
```css
.milestone-markers {
  @apply absolute inset-0;
}

.milestone-marker {
  @apply absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
         cursor-pointer z-10;
}

.marker-dot {
  @apply w-4 h-4 rounded-full border-2 border-white shadow-md
         transition-all duration-200;
}

.milestone-marker.completed .marker-dot {
  @apply bg-green-500 border-green-600 scale-110;
}

.milestone-marker.pending .marker-dot {
  @apply bg-gray-300 border-gray-400;
}

.milestone-marker.current .marker-dot {
  @apply bg-blue-500 border-blue-600 animate-pulse scale-125;
}

.marker-tooltip {
  @apply absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
         opacity-0 group-hover:opacity-100 transition-opacity duration-200
         pointer-events-none;
}

.tooltip-text {
  @apply bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded
         whitespace-nowrap;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2
         w-0 h-0 border-l-4 border-r-4 border-t-4
         border-transparent border-t-gray-900;
}
```

#### Status Indicators
```css
.progress-status-badge {
  @apply inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium;
}

.progress-status-badge.success {
  @apply bg-green-100 text-green-800;
}

.progress-status-badge.warning {
  @apply bg-amber-100 text-amber-800;
}

.progress-status-badge.danger {
  @apply bg-red-100 text-red-800;
}

.status-dot {
  @apply w-1.5 h-1.5 rounded-full;
}

.progress-status-badge.success .status-dot {
  @apply bg-green-500 animate-pulse;
}

.progress-status-badge.warning .status-dot {
  @apply bg-amber-500 animate-pulse;
}

.progress-status-badge.danger .status-dot {
  @apply bg-red-500 animate-ping;
}
```

### Animated Fill States

#### Progress Animation (Framer Motion)
```jsx
const progressVariants = {
  initial: { 
    width: 0,
    opacity: 0.8 
  },
  animate: (progress) => ({
    width: `${progress}%`,
    opacity: 1,
    transition: {
      width: { duration: 1.5, ease: "easeOut", delay: 0.2 },
      opacity: { duration: 0.5 }
    }
  })
}

const milestoneVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: (isReached) => ({
    scale: isReached ? 1.1 : 1,
    opacity: 1,
    transition: {
      delay: isReached ? 1.0 : 1.5,
      duration: 0.4,
      ease: "backOut"
    }
  })
}
```

#### Success Celebration Animation
```css
.progress-complete {
  animation: progressSuccess 1s ease-in-out;
}

@keyframes progressSuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.progress-complete::after {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-green-400 to-green-500
         opacity-0 rounded-full;
  animation: successGlow 2s ease-in-out;
}

@keyframes successGlow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.3; }
}
```

### Progress Variants

#### Thin Progress Bar
```css
.progress-bar-thin .progress-bar-wrapper {
  @apply h-1;
}

.progress-bar-thin .progress-bar-fill {
  @apply h-1;
}

.progress-bar-thin .milestone-marker .marker-dot {
  @apply w-3 h-3;
}
```

#### Thick Progress Bar
```css
.progress-bar-thick .progress-bar-wrapper {
  @apply h-5;
}

.progress-bar-thick .progress-bar-fill {
  @apply h-5;
}

.progress-bar-thick .milestone-marker .marker-dot {
  @apply w-5 h-5;
}
```

#### Gradient Variants
```css
.progress-success {
  @apply bg-gradient-to-r from-green-500 to-green-600;
}

.progress-warning {
  @apply bg-gradient-to-r from-amber-500 to-amber-600;
}

.progress-danger {
  @apply bg-gradient-to-r from-red-500 to-red-600;
}

.progress-purple {
  @apply bg-gradient-to-r from-purple-500 to-purple-600;
}
```

### Funding Details Styling

#### Amount Display
```css
.funding-current,
.funding-target {
  @apply flex flex-col space-y-1;
}

.amount-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.amount-value {
  @apply text-base font-bold text-gray-900 tabular-nums;
}

.amount-usd {
  @apply text-xs text-gray-500 tabular-nums;
}
```

#### Transparency Features
```css
.progress-transparency {
  @apply mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200;
}

.transparency-grid {
  @apply grid grid-cols-3 gap-4;
}

.transparency-item {
  @apply flex items-center space-x-2;
}

.transparency-icon {
  @apply flex-shrink-0;
}

.transparency-content {
  @apply flex flex-col min-w-0;
}

.transparency-label {
  @apply text-xs text-gray-500 font-medium;
}

.transparency-value {
  @apply text-xs font-bold text-gray-900 truncate;
}
```

### Live Updates

#### Update Indicator
```css
.progress-updates {
  @apply mt-3 flex items-center justify-between text-xs;
}

.update-indicator {
  @apply flex items-center space-x-2;
}

.update-pulse {
  @apply w-2 h-2 bg-green-400 rounded-full animate-pulse;
}

.update-text {
  @apply text-gray-500;
}

.update-link {
  @apply text-blue-600 hover:text-blue-700 font-medium underline;
}
```

### Responsive Behavior

#### Mobile (320-768px)
```css
.progress-bar-container-mobile .progress-bar-footer {
  @apply flex-col space-y-2 items-start;
}

.progress-bar-container-mobile .transparency-grid {
  @apply grid-cols-1 gap-2;
}

.progress-bar-container-mobile .progress-percentage {
  @apply text-xl;
}

.progress-bar-container-mobile .milestone-marker {
  @apply hidden;
}
```

#### Tablet (769-1024px)
```css
.progress-bar-container-tablet .transparency-grid {
  @apply grid-cols-2;
}
```

### Micro-interactions

#### Hover Effects
```css
.progress-bar-wrapper:hover .progress-bar-fill {
  @apply shadow-md;
}

.progress-bar-wrapper:hover .progress-glow {
  @apply opacity-100 scale-105;
}

.milestone-marker:hover .marker-dot {
  @apply scale-125 shadow-lg;
}

.milestone-marker:hover .marker-tooltip {
  @apply opacity-100;
}
```

#### Click Animation
```css
.progress-bar-fill:active {
  @apply scale-98;
  transition: transform 0.1s ease-in-out;
}

.milestone-marker:active .marker-dot {
  @apply scale-90;
  transition: transform 0.1s ease-in-out;
}
```

### Accessibility

#### ARIA Labels
```html
<div class="progress-bar-container">
  <div role="progressbar" 
       aria-valuemin="0" 
       aria-valuemax="100" 
       aria-valuenow="65"
       aria-label="Funding progress: 65% complete, 325.5 ETH raised of 500 ETH target"
       aria-describedby="progress-details">
    
    <div class="progress-bar-fill" style="width: 65%">
      <span class="sr-only">65% complete</span>
    </div>
  </div>
  
  <div id="progress-details" class="sr-only">
    Current funding: 325.5 ETH. Target funding: 500 ETH. 
    Progress milestones: 25% and 50% completed, 75% milestone pending.
  </div>
  
  <div class="milestone-markers">
    <button class="milestone-marker completed" 
            aria-label="25% milestone completed"
            tabindex="0">
      <div class="marker-dot"></div>
    </button>
  </div>
</div>
```

#### Keyboard Navigation
```css
.milestone-marker {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-full;
}

.progress-bar-wrapper:focus {
  @apply outline-none ring-2 ring-blue-600 ring-offset-2;
}
```

#### Screen Reader Support
```css
.sr-only {
  @apply sr-only;
}

.progress-percentage {
  @apply aria-hidden;
}

/* Live region for updates */
.progress-live-region {
  @apply sr-only;
  /* aria-live="polite" aria-atomic="true" */
}
```

---

This comprehensive component specifications document provides production-ready designs for all 5 required components with exact implementation details, animations, and accessibility features using Tailwind CSS and Framer Motion.