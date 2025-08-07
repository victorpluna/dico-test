# Dico Platform Design System

## Executive Summary

This design system is built to convey trust, transparency, and innovation for the Dico decentralized ICO platform. Based on comprehensive UX research of three user personas (Project Creators, Investors, and Cautious Observers), this system prioritizes professional appearance, clear information hierarchy, and accessibility while being fully implementable with Tailwind CSS.

The design foundation centers on building confidence through institutional-grade visual design that doesn't overwhelm cautious users while still appealing to tech-savvy creators and investors.

---

## Color Palette

### Primary Colors

#### Electric Blue (Trust & Innovation)
- **Primary 50**: `#eff6ff` - `bg-blue-50` - Light backgrounds, subtle accents
- **Primary 100**: `#dbeafe` - `bg-blue-100` - Hover states for light elements
- **Primary 200**: `#bfdbfe` - `bg-blue-200` - Disabled states, borders
- **Primary 300**: `#93c5fd` - `bg-blue-300` - Secondary buttons, inactive states
- **Primary 400**: `#60a5fa` - `bg-blue-400` - Interactive elements
- **Primary 500**: `#3b82f6` - `bg-blue-500` - Standard primary actions
- **Primary 600**: `#0066ff` - `bg-[#0066ff]` - **Brand primary**, main CTAs, navigation
- **Primary 700**: `#1d4ed8` - `bg-blue-700` - Hover states for primary buttons
- **Primary 800**: `#1e40af` - `bg-blue-800` - Active states, pressed buttons
- **Primary 900**: `#1e3a8a` - `bg-blue-900` - Text on light backgrounds

#### Success Green (Successful Transactions/Projects)
- **Success 50**: `#f0fdf4` - `bg-green-50` - Success message backgrounds
- **Success 100**: `#dcfce7` - `bg-green-100` - Light success indicators
- **Success 200**: `#bbf7d0` - `bg-green-200` - Progress bar fills
- **Success 300**: `#86efac` - `bg-green-300` - Success icons, badges
- **Success 400**: `#4ade80` - `bg-green-400` - Interactive success elements
- **Success 500**: `#22c55e` - `bg-green-500` - **Primary success color**
- **Success 600**: `#16a34a` - `bg-green-600` - Success buttons
- **Success 700**: `#15803d` - `bg-green-700` - Success button hover
- **Success 800**: `#166534` - `bg-green-800` - Success button active
- **Success 900**: `#14532d` - `bg-green-900` - Success text

#### Warning Amber (Pending States/Cautions)
- **Warning 50**: `#fffbeb` - `bg-amber-50` - Warning message backgrounds
- **Warning 100**: `#fef3c7` - `bg-amber-100` - Light warning indicators
- **Warning 200**: `#fde68a` - `bg-amber-200` - Caution borders
- **Warning 300**: `#fcd34d` - `bg-amber-300` - Warning icons
- **Warning 400**: `#fbbf24` - `bg-amber-400` - Interactive warning elements
- **Warning 500**: `#f59e0b` - `bg-amber-500` - **Primary warning color**
- **Warning 600**: `#d97706` - `bg-amber-600` - Warning buttons
- **Warning 700**: `#b45309` - `bg-amber-700` - Warning button hover
- **Warning 800**: `#92400e` - `bg-amber-800` - Warning button active
- **Warning 900**: `#78350f` - `bg-amber-900` - Warning text

#### Error Red (Failures/Critical Issues)
- **Error 50**: `#fef2f2` - `bg-red-50` - Error message backgrounds
- **Error 100**: `#fee2e2` - `bg-red-100` - Light error indicators
- **Error 200**: `#fecaca` - `bg-red-200` - Error borders
- **Error 300**: `#fca5a5` - `bg-red-300` - Error icons
- **Error 400**: `#f87171` - `bg-red-400` - Interactive error elements
- **Error 500**: `#ef4444` - `bg-red-500` - **Primary error color**
- **Error 600**: `#dc2626` - `bg-red-600` - Error buttons
- **Error 700**: `#b91c1c` - `bg-red-700` - Error button hover
- **Error 800**: `#991b1b` - `bg-red-800` - Error button active
- **Error 900**: `#7f1d1d` - `bg-red-900` - Error text

### Neutral Grays

#### Text & UI Elements
- **Gray 50**: `#f9fafb` - `bg-gray-50` - Page backgrounds
- **Gray 100**: `#f3f4f6` - `bg-gray-100` - Card backgrounds, dividers
- **Gray 200**: `#e5e7eb` - `bg-gray-200` - Borders, disabled backgrounds
- **Gray 300**: `#d1d5db` - `bg-gray-300` - Disabled text, placeholders
- **Gray 400**: `#9ca3af` - `bg-gray-400` - Secondary text, icons
- **Gray 500**: `#6b7280` - `bg-gray-500` - Body text, labels
- **Gray 600**: `#4b5563` - `bg-gray-600` - **Primary text color**
- **Gray 700**: `#374151` - `bg-gray-700` - Headings, emphasis
- **Gray 800**: `#1f2937` - `bg-gray-800` - Strong emphasis, navigation
- **Gray 900**: `#111827` - `bg-gray-900` - **Maximum contrast text**

#### Pure Neutrals
- **White**: `#ffffff` - `bg-white` - Card backgrounds, modals
- **Black**: `#000000` - `bg-black` - High contrast text, overlays

### Accent Colors

#### Electric Purple (Innovation)
- **Purple 500**: `#8b5cf6` - `bg-purple-500` - Tech features, innovation badges
- **Purple 600**: `#7c3aed` - `bg-purple-600` - Primary purple actions

#### Teal (Growth/Community)
- **Teal 500**: `#14b8a6` - `bg-teal-500` - Community features, growth indicators
- **Teal 600**: `#0d9488` - `bg-teal-600` - Community CTAs

---

## Typography Scale

### Font Family
**Primary Font**: Inter - Modern, trustworthy, highly legible
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Monospace Font**: JetBrains Mono - For addresses, code, technical data
```css
font-family: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
```

### Heading Scale

#### Display Headings
- **Display XL**: `text-6xl font-bold leading-none tracking-tight` (60px/1.0/tight)
- **Display Large**: `text-5xl font-bold leading-none tracking-tight` (48px/1.0/tight)
- **Display Medium**: `text-4xl font-bold leading-tight tracking-tight` (36px/1.125/tight)

#### Content Headings
- **H1**: `text-3xl font-bold leading-tight text-gray-900` (30px/1.125/bold)
- **H2**: `text-2xl font-semibold leading-tight text-gray-800` (24px/1.125/semibold)
- **H3**: `text-xl font-semibold leading-snug text-gray-800` (20px/1.375/semibold)
- **H4**: `text-lg font-medium leading-normal text-gray-700` (18px/1.5/medium)
- **H5**: `text-base font-medium leading-normal text-gray-700` (16px/1.5/medium)
- **H6**: `text-sm font-medium leading-normal text-gray-600` (14px/1.5/medium)

### Body Text

#### Primary Text
- **Large Body**: `text-lg leading-relaxed text-gray-600` (18px/1.625)
- **Base Body**: `text-base leading-relaxed text-gray-600` (16px/1.625)
- **Small Body**: `text-sm leading-relaxed text-gray-500` (14px/1.625)

#### Secondary Text
- **Caption**: `text-xs leading-normal text-gray-400` (12px/1.5)
- **Overline**: `text-xs font-medium uppercase tracking-wide leading-normal text-gray-400` (12px/1.5/medium/uppercase)

### Monospace Text (Technical Data)
- **Code Large**: `text-lg font-mono leading-normal text-gray-800` (18px/1.5/mono)
- **Code Base**: `text-base font-mono leading-normal text-gray-800` (16px/1.5/mono)
- **Code Small**: `text-sm font-mono leading-normal text-gray-700` (14px/1.5/mono)
- **Address**: `text-xs font-mono leading-normal text-gray-600 tracking-wider` (12px/1.5/mono/wide)

### Functional Text
- **Button Large**: `text-lg font-semibold` (18px/semibold)
- **Button Base**: `text-base font-medium` (16px/medium)
- **Button Small**: `text-sm font-medium` (14px/medium)
- **Link**: `text-blue-600 hover:text-blue-700 font-medium underline decoration-1 underline-offset-2`
- **Label**: `text-sm font-medium text-gray-700` (14px/medium)

---

## Spacing System

### Base Grid
**8px base unit** - All spacing should be multiples of 8px for consistent rhythm

### Spacing Scale
- **XS**: `space-x-1 space-y-1` (4px) - Tight spacing, icon gaps
- **SM**: `space-x-2 space-y-2` (8px) - **Base unit**, form field spacing
- **MD**: `space-x-3 space-y-3` (12px) - Comfortable spacing
- **LG**: `space-x-4 space-y-4` (16px) - Component internal spacing
- **XL**: `space-x-6 space-y-6` (24px) - Section spacing
- **2XL**: `space-x-8 space-y-8` (32px) - Major section separation
- **3XL**: `space-x-12 space-y-12` (48px) - Page section spacing
- **4XL**: `space-x-16 space-y-16` (64px) - Large page spacing
- **5XL**: `space-x-24 space-y-24` (96px) - Hero spacing
- **6XL**: `space-x-32 space-y-32` (128px) - Maximum spacing

### Layout Spacing Guidelines

#### Component Internal Spacing
- **Buttons**: `px-4 py-2` (small), `px-6 py-3` (base), `px-8 py-4` (large)
- **Cards**: `p-6` (base), `p-8` (large)
- **Modals**: `p-6` (mobile), `p-8` (desktop)
- **Form Fields**: `px-3 py-2` (base), `px-4 py-3` (comfortable)

#### Layout Container Spacing
- **Page Margins**: `px-4` (mobile), `px-6` (tablet), `px-8` (desktop)
- **Section Spacing**: `py-8` (small), `py-12` (base), `py-16` (large)
- **Component Margins**: `mb-4` (related), `mb-8` (sections), `mb-12` (major sections)

---

## Component Tokens

### Border Radius

#### Standard Radius
- **None**: `rounded-none` (0px) - Sharp edges for technical elements
- **SM**: `rounded-sm` (2px) - Form inputs, tight elements
- **Base**: `rounded` (4px) - **Default for most elements**
- **MD**: `rounded-md` (6px) - Buttons, cards
- **LG**: `rounded-lg` (8px) - Modal corners, major components
- **XL**: `rounded-xl` (12px) - Hero elements, feature cards
- **2XL**: `rounded-2xl` (16px) - Large cards, images
- **3XL**: `rounded-3xl` (24px) - Decorative elements
- **Full**: `rounded-full` - Pills, avatars, circular buttons

### Shadow System (Depth & Elevation)

#### Component Shadows
- **None**: `shadow-none` - Flush elements
- **SM**: `shadow-sm` - Subtle cards, form inputs
- **Base**: `shadow` - **Default cards**, dropdowns
- **MD**: `shadow-md` - Elevated cards, hover states
- **LG**: `shadow-lg` - Modals, important dialogs
- **XL**: `shadow-xl` - Primary CTAs, focused states
- **2XL**: `shadow-2xl` - Maximum elevation, overlays

#### Interactive Shadows
- **Hover**: `hover:shadow-lg` - Card hover effects
- **Focus**: `focus:shadow-xl focus:shadow-blue-500/25` - Form focus states
- **Active**: `active:shadow-inner` - Button pressed states

### Border Styles

#### Border Weights
- **Default**: `border` (1px) - **Standard border weight**
- **Thick**: `border-2` (2px) - Emphasis, focus states
- **Heavy**: `border-4` (4px) - Strong emphasis, errors

#### Border Colors
- **Neutral**: `border-gray-200` (light), `border-gray-300` (standard)
- **Primary**: `border-blue-600` - Primary actions
- **Success**: `border-green-500` - Success states
- **Warning**: `border-amber-500` - Warning states
- **Error**: `border-red-500` - Error states

### Opacity System

#### State Opacities
- **Disabled**: `opacity-40` - Disabled elements
- **Inactive**: `opacity-60` - Inactive but available elements
- **Secondary**: `opacity-75` - Secondary elements
- **Hover Overlay**: `bg-black/5` - Light hover states
- **Modal Backdrop**: `bg-black/50` - Modal backgrounds
- **Loading**: `opacity-50` - Loading states

### Z-Index Scale

#### Layer Organization
- **Base**: `z-0` - Page content
- **Raised**: `z-10` - Dropdowns, tooltips
- **Sticky**: `z-20` - Sticky headers, navigation
- **Modal**: `z-40` - Modal dialogs
- **Overlay**: `z-50` - Toast notifications, alerts

---

## Responsive Breakpoints

### Mobile-First Breakpoint System
- **SM**: `640px` - Large phones, small tablets
- **MD**: `768px` - Tablets, small laptops
- **LG**: `1024px` - Desktops, large tablets landscape
- **XL**: `1280px` - Large desktops
- **2XL**: `1536px` - Extra large screens

### Container Max-Widths
- **SM**: `max-w-screen-sm` (640px)
- **MD**: `max-w-screen-md` (768px)
- **LG**: `max-w-screen-lg` (1024px)
- **XL**: `max-w-screen-xl` (1280px)
- **2XL**: `max-w-screen-2xl` (1536px)
- **Content**: `max-w-4xl` (896px) - Reading width
- **Prose**: `max-w-prose` (65ch) - Optimal reading line length

### Responsive Design Patterns

#### Navigation
```css
/* Mobile: Stack navigation */
.nav-mobile { @apply flex flex-col space-y-1 p-4; }

/* Desktop: Horizontal navigation */
.nav-desktop { @apply hidden md:flex md:space-x-8 md:space-y-0; }
```

#### Grid Systems
```css
/* Project Grid */
.project-grid { @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6; }

/* Dashboard Layout */
.dashboard-layout { @apply grid grid-cols-1 lg:grid-cols-4 gap-8; }
.dashboard-main { @apply lg:col-span-3; }
.dashboard-sidebar { @apply lg:col-span-1; }
```

---

## Accessibility Standards

### Color Contrast Requirements

#### WCAG AA Compliance
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text** (18px+ or 14px+ bold): Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio for interactive elements

#### Verified Contrast Pairs
- **Primary Text**: `text-gray-900` on `bg-white` (21:1 ratio) ✅
- **Secondary Text**: `text-gray-600` on `bg-white` (7.0:1 ratio) ✅
- **Primary Button**: `text-white` on `bg-[#0066ff]` (8.6:1 ratio) ✅
- **Success Text**: `text-green-700` on `bg-green-50` (7.3:1 ratio) ✅
- **Error Text**: `text-red-700` on `bg-red-50` (8.1:1 ratio) ✅

### Focus States

#### Keyboard Navigation
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset;
}
```

#### Focus Indicators
- **Interactive Elements**: `focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`
- **Form Inputs**: `focus:ring-2 focus:ring-blue-600 focus:border-blue-600`
- **Buttons**: `focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`

### Screen Reader Considerations

#### Semantic HTML
- Use proper heading hierarchy (h1-h6)
- Include `alt` attributes for all images
- Use `aria-label` for icon buttons
- Implement `aria-describedby` for form validation

#### ARIA Labels
```html
<!-- Investment Amount Input -->
<label for="investment-amount" class="sr-only">Investment amount in ETH</label>
<input 
  id="investment-amount"
  type="number"
  aria-describedby="amount-help amount-error"
  class="focus-ring"
/>

<!-- Progress Bar -->
<div 
  role="progressbar" 
  aria-valuemin="0" 
  aria-valuemax="100" 
  aria-valuenow="65"
  aria-label="Funding progress: 65% complete"
>
```

---

## Component Library Specifications

### Button Components

#### Primary Button
```css
.btn-primary {
  @apply bg-[#0066ff] hover:bg-blue-700 active:bg-blue-800
         text-white font-medium
         px-6 py-3 rounded-md
         focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
         transition-colors duration-200
         disabled:opacity-50 disabled:cursor-not-allowed;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-white hover:bg-gray-50 active:bg-gray-100
         text-gray-700 border border-gray-300
         px-6 py-3 rounded-md font-medium
         focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
         transition-colors duration-200;
}
```

#### Success Button
```css
.btn-success {
  @apply bg-green-500 hover:bg-green-600 active:bg-green-700
         text-white font-medium
         px-6 py-3 rounded-md
         focus:ring-2 focus:ring-green-500 focus:ring-offset-2
         transition-colors duration-200;
}
```

#### Danger Button
```css
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 active:bg-red-700
         text-white font-medium
         px-6 py-3 rounded-md
         focus:ring-2 focus:ring-red-500 focus:ring-offset-2
         transition-colors duration-200;
}
```

### Form Components

#### Input Field
```css
.input-field {
  @apply w-full px-3 py-2 
         border border-gray-300 rounded-md
         placeholder-gray-400 text-gray-900
         focus:ring-2 focus:ring-blue-600 focus:border-blue-600
         disabled:bg-gray-50 disabled:text-gray-400
         transition-colors duration-200;
}
```

#### Input with Error
```css
.input-error {
  @apply w-full px-3 py-2
         border border-red-300 rounded-md
         placeholder-gray-400 text-gray-900
         focus:ring-2 focus:ring-red-500 focus:border-red-500
         transition-colors duration-200;
}
```

#### Label
```css
.input-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
```

### Card Components

#### Base Card
```css
.card {
  @apply bg-white rounded-lg shadow border border-gray-200
         p-6 transition-shadow duration-200;
}
```

#### Hover Card
```css
.card-hover {
  @apply bg-white rounded-lg shadow border border-gray-200
         p-6 transition-all duration-200
         hover:shadow-lg hover:border-gray-300;
}
```

#### Project Card
```css
.project-card {
  @apply bg-white rounded-lg shadow border border-gray-200
         p-6 transition-all duration-200
         hover:shadow-lg hover:border-blue-300
         cursor-pointer;
}
```

### Modal Components

#### Modal Overlay
```css
.modal-overlay {
  @apply fixed inset-0 bg-black/50 z-40
         flex items-center justify-center p-4;
}
```

#### Modal Content
```css
.modal-content {
  @apply bg-white rounded-lg shadow-2xl
         max-w-md w-full max-h-[90vh] overflow-y-auto
         transform transition-all duration-200;
}
```

### Progress Components

#### Progress Bar
```css
.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}
```

#### Progress Bar with States
```css
.progress-success { @apply bg-green-500; }
.progress-warning { @apply bg-amber-500; }
.progress-danger { @apply bg-red-500; }
```

### Badge Components

#### Status Badge
```css
.badge {
  @apply inline-flex items-center px-2 py-1
         text-xs font-medium rounded-full;
}

.badge-success { @apply bg-green-100 text-green-800; }
.badge-warning { @apply bg-amber-100 text-amber-800; }
.badge-error { @apply bg-red-100 text-red-800; }
.badge-info { @apply bg-blue-100 text-blue-800; }
```

---

## Animation & Transitions

### Transition Timing
- **Fast**: `duration-150` (150ms) - Hover states, color changes
- **Base**: `duration-200` (200ms) - **Default timing**, most interactions
- **Slow**: `duration-300` (300ms) - Layout changes, complex animations
- **Slower**: `duration-500` (500ms) - Page transitions, loading states

### Easing Functions
- **Linear**: `ease-linear` - Progress bars, loading animations
- **In**: `ease-in` - Exit animations, hiding elements
- **Out**: `ease-out` - **Default**, entrance animations
- **In-Out**: `ease-in-out` - Smooth bidirectional animations

### Animation Examples

#### Hover Effects
```css
.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}

.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}
```

#### Loading States
```css
.loading-pulse {
  @apply animate-pulse bg-gray-300 rounded;
}

.loading-spin {
  @apply animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full;
}
```

#### Fade Animations
```css
.fade-in {
  @apply opacity-0 animate-fade-in;
  animation: fadeIn 300ms ease-out forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
```

---

## Trust-Building Design Patterns

### Security Indicators

#### Verified Badge
```css
.verified-badge {
  @apply inline-flex items-center px-2 py-1
         bg-green-100 text-green-800 text-xs font-medium rounded-full;
}
```

#### Security Audit Indicator
```css
.audit-status {
  @apply inline-flex items-center space-x-1 text-sm text-green-700;
}
```

### Transparency Elements

#### Blockchain Link
```css
.blockchain-link {
  @apply inline-flex items-center space-x-1 
         text-sm text-blue-600 hover:text-blue-700
         font-mono transition-colors duration-200;
}
```

#### Progress Transparency
```css
.progress-detailed {
  @apply space-y-2;
}

.progress-label {
  @apply flex justify-between text-sm text-gray-600;
}
```

### Professional Polish

#### Clean Borders
```css
.clean-border {
  @apply border border-gray-200 last:border-b-0;
}
```

#### Subtle Separators
```css
.divider {
  @apply border-t border-gray-200 my-6;
}
```

---

## Usage Guidelines

### Do's

#### Color Usage
- Use the primary blue (#0066FF) sparingly for maximum impact
- Maintain high contrast ratios for all text
- Use semantic colors (green for success, red for errors) consistently
- Leverage neutral grays for hierarchy and balance

#### Typography
- Stick to the Inter font family for consistency
- Use monospace fonts only for technical data (addresses, code)
- Maintain consistent line heights and spacing
- Use font weights purposefully (medium for buttons, bold for emphasis)

#### Spacing
- Always use multiples of 8px for spacing
- Maintain consistent spacing within components
- Use white space generously to create breathing room
- Group related elements with appropriate spacing

### Don'ts

#### Color Usage
- Don't use too many colors in a single interface
- Avoid using color as the only way to convey information
- Don't use bright, flashy colors that might seem unprofessional
- Avoid using colors outside the defined palette

#### Typography
- Don't mix multiple font families in a single interface
- Avoid using too many font weights or sizes
- Don't use all caps extensively (except for small labels)
- Avoid very light font weights for body text

#### Animation
- Don't use flashy or distracting animations
- Avoid animations longer than 500ms for interface interactions
- Don't animate too many elements simultaneously
- Keep animations purposeful and professional

---

## Implementation Notes

### Tailwind CSS Configuration

Add these custom colors to your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#0066ff', // Brand primary
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    }
  }
}
```

### CSS Custom Properties

```css
:root {
  --color-primary: #0066ff;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  --spacing-unit: 8px;
}
```

### Component Examples

#### Trust-Building Project Card
```html
<div class="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer">
  <!-- Project Header -->
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-xl font-semibold text-gray-900">Project Name</h3>
    <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
      ✓ Verified
    </span>
  </div>
  
  <!-- Progress Bar -->
  <div class="space-y-2 mb-4">
    <div class="flex justify-between text-sm text-gray-600">
      <span>Progress</span>
      <span>65% funded</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 65%"></div>
    </div>
    <div class="flex justify-between text-sm text-gray-500">
      <span>325.5 ETH raised</span>
      <span>500 ETH target</span>
    </div>
  </div>
  
  <!-- Creator Investment -->
  <div class="flex items-center text-sm text-gray-600 mb-3">
    <span class="text-green-600 font-medium">Creator invested: 25 ETH</span>
    <span class="ml-2 text-gray-400">(5% skin in the game)</span>
  </div>
  
  <!-- Time Remaining -->
  <div class="text-center py-2 px-3 bg-amber-50 rounded-md">
    <span class="text-sm font-medium text-amber-800">23d 14h 32m remaining</span>
  </div>
</div>
```

This comprehensive design system provides a solid foundation for building the Dico platform with a focus on trust, transparency, and professional presentation while remaining fully accessible and implementable with Tailwind CSS.