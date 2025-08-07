# Dico Platform - Feature Requirements & Wireframes

## Executive Summary

This document defines the information architecture and user flows for the Dico decentralized ICO platform, based on comprehensive user research analyzing Project Creators, Investors, and Cautious Observers. The design prioritizes trust, transparency, and ease of use while addressing the specific concerns and motivations of each persona.

---

## A. Project Creation Form

### Information Architecture

#### Primary Layout Structure
- **Header Section**: Platform branding, wallet connection status, navigation breadcrumb
- **Progress Indicator**: 7-step visual progress bar showing completion status
- **Form Container**: Centered, maximum 800px width with clear visual hierarchy
- **Action Panel**: Fixed bottom bar with save draft, preview, and submit actions

#### Field Organization & Visual Hierarchy

**Section 1: Project Documentation (Trust Foundation)**
- White Paper URL (Primary importance)
  - IPFS validation indicator with real-time feedback
  - Preview thumbnail/link validation status
  - Help tooltip explaining IPFS requirements
- Project Plan URL (Primary importance)
  - IPFS validation with visual confirmation
  - Document type verification (PDF/markdown)
  - Integration with common document platforms

**Section 2: Technical Implementation (Creator Confidence)**
- Smart Contract Code (High prominence)
  - Full-screen expandable Solidity editor
  - Syntax highlighting with error detection
  - Template library integration
  - Compilation status indicator
  - Security audit suggestion prompts

**Section 3: Economic Model (Investor Trust)**
- Tokenomics Display Section (Visual emphasis)
  - Interactive token distribution chart
  - Vesting schedule visualization
  - Utility explanation fields
  - Economic model validation checks

**Section 4: Funding Structure (Critical Decision Point)**
- Own Funding Amount (ETH) (High visibility)
  - Large, prominent input with ETH conversion
  - Minimum threshold validation (prevents spam)
  - Percentage of target calculation
  - Skin-in-game trust indicator
- Target Funding Amount (ETH) (Primary prominence)
  - Goal visualization with milestone markers
  - Market comparison context
  - Success probability indicators
- Funding Address (Security critical)
  - Wallet integration with MetaMask
  - Address validation with ENS support
  - Multi-signature option recommendation

### User Flow Design

#### Entry Points
1. **Main Navigation**: "Launch Project" CTA in platform header
2. **Dashboard**: "Create New Project" card for returning creators
3. **Marketing Pages**: "Get Started" buttons throughout platform

#### Progressive Disclosure Pattern
1. **Information Gathering** (Steps 1-3): Documentation and technical setup
2. **Economic Configuration** (Steps 4-5): Tokenomics and funding parameters
3. **Validation & Preview** (Steps 6-7): Review and final submission

#### Form Interaction Patterns
- **Auto-save**: Continuous draft saving with visual confirmation
- **Field Dependencies**: Dynamic validation based on connected wallet and previous inputs
- **Smart Defaults**: Pre-populated values based on common patterns and user history
- **Contextual Help**: Progressive help system with expandable details

#### Validation & Error Handling
- **Real-time Validation**: Immediate feedback on each field completion
- **Progressive Validation**: Increasing validation rigor as user progresses
- **Error Prevention**: Smart suggestions and warnings before errors occur
- **Recovery Guidance**: Clear next steps for resolving validation failures

### Trust Signals Integration
- **Progress Transparency**: Clear completion percentage and remaining steps
- **Security Indicators**: Visual confirmations for wallet connections and validations
- **Professional Presentation**: Clean, institutional-grade visual design
- **Data Protection**: Explicit privacy and security messaging

---

## B. Active Projects Grid

### Information Architecture

#### Grid Layout Structure
- **Filter Panel**: Left sidebar (collapsible on mobile)
- **Sort Controls**: Top bar with relevance, funding progress, and time options
- **Project Cards**: Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- **Pagination**: Bottom loading with infinite scroll option

#### Card Design Priority (Based on Investor Decision Factors)

**Primary Information (Above fold, largest text)**
- Project Name & Logo Placeholder (Trust anchor)
- Progress Bar with Current/Target Funding (Decision critical)
  - Visual progress indicator (green = healthy, yellow = concerning, red = urgent)
  - Actual ETH amounts in secondary text
  - Percentage completion in prominent position

**Secondary Information (Immediately visible)**
- Time Remaining (Urgency driver)
  - Countdown format: "23d 14h 32m" for active urgency
  - Color coding: Green (>30 days), Yellow (7-30 days), Red (<7 days)
- Own Funding Amount (Skin-in-game indicator)
  - "Creator invested: 5.2 ETH" format
  - Percentage of target as trust signal

**Tertiary Information (Supporting details)**
- Quick Stats Summary
  - Backers count (social proof)
  - Total ETH raised (momentum indicator)
  - Recent activity indicator (live updates)

#### Visual Hierarchy Implementation
- **Card Elevation**: Hover states with subtle shadows
- **Status Indicators**: Color-coded borders and progress elements
- **Information Density**: Balanced information without overwhelming
- **Mobile Optimization**: Single column with optimized information density

### User Flow Design

#### Discovery Patterns
1. **Browse Mode**: Default grid view with all active projects
2. **Filter Mode**: Sidebar filtering by category, funding stage, timeline
3. **Search Mode**: Text search with intelligent matching
4. **Personalized Mode**: Recommended projects based on investment history

#### Interaction Patterns
- **Quick Preview**: Hover/tap for expanded card information
- **Comparison Mode**: Select multiple projects for side-by-side comparison
- **Investment Intent**: Quick investment button for registered users
- **Bookmark System**: Save projects for later detailed review

#### Trust Building Elements
- **Creator Verification**: Verified badges for established creators
- **Audit Status**: Security audit completion indicators
- **Community Validation**: Community score based on engagement
- **Historical Performance**: Platform success rate context

---

## C. Project Detail View

### Information Architecture

#### Page Layout Structure
- **Hero Section**: Project branding, key metrics, primary CTA
- **Navigation Tabs**: Information organization with clear hierarchy
- **Content Area**: Tab-based content with deep-linking support
- **Sidebar**: Investment interface, key stats, trust indicators

#### Content Organization Priority

**Tab 1: Overview (Default landing)**
- Project summary and value proposition
- Team information with verification status
- Roadmap with milestone tracking
- Token utility and use cases

**Tab 2: Technical Details**
- Smart contract code viewer with syntax highlighting
- Technical documentation and architecture
- Security audit reports and status
- Integration specifications

**Tab 3: Financials**
- Detailed tokenomics with interactive visualizations
- Funding allocation breakdown
- Financial projections and models
- Transparency reports and fund usage

**Tab 4: Community**
- Backer list with addresses and investment amounts (privacy-respecting)
- Transaction history with blockchain verification
- Community discussion and updates
- Social proof and endorsements

#### Smart Contract Code Viewer
- **Syntax Highlighting**: Professional code presentation
- **Line Numbers**: Easy reference and discussion
- **Expandable Sections**: Function-by-function breakdown
- **Audit Overlays**: Security audit annotations
- **Copy Functionality**: Easy verification and review

### Investment Interface Design

#### Sidebar Positioning (Sticky)
- **Investment Summary**: Current status and key metrics
- **Investment Form**: ETH amount input with validation
- **Trust Indicators**: Security badges and verification status
- **Quick Actions**: Bookmark, share, report functionality

#### Investment Flow Integration
- **Single-Click Access**: Direct integration with investment modal
- **Context Preservation**: Maintain project context throughout flow
- **Progress Tracking**: Clear indication of investment process status
- **Error Recovery**: Seamless handling of transaction failures

### User Flow Design

#### Entry Points
1. **Project Grid**: Direct navigation from project cards
2. **Search Results**: Deep-linking to specific project details
3. **User Dashboard**: Recent/bookmarked projects access
4. **Social Sharing**: External links with proper context

#### Information Consumption Patterns
1. **Quick Assessment**: Hero section for immediate decision factors
2. **Deep Dive**: Progressive disclosure through tab navigation
3. **Technical Review**: Dedicated code and audit examination
4. **Social Validation**: Community and backer information review

---

## D. Investment Modal

### Information Architecture

#### Modal Structure (Overlay Design)
- **Header**: Project context, close functionality
- **Content Area**: Investment form with progressive disclosure
- **Footer**: Action buttons and secondary options
- **Background**: Darkened overlay maintaining context

#### Form Layout Priority

**Primary Section (Above fold)**
- ETH Amount Input (Large, prominent)
  - Real-time USD conversion
  - Wallet balance validation
  - Investment limits display
- Gas Fee Estimation (Transparency critical)
  - Real-time network fee calculation
  - Speed options (slow, standard, fast)
  - Total cost summary

**Secondary Section (Immediately accessible)**
- Investment Summary
  - Token allocation preview
  - Vesting schedule display
  - Rights and benefits summary
- Risk Acknowledgment
  - Clear risk disclosure
  - Regulatory compliance notices
  - Terms acceptance checkboxes

### State Management Design

#### Pre-Transaction State
- **Input Validation**: Real-time balance and minimum checks
- **Fee Calculation**: Dynamic gas estimation with network status
- **Summary Preview**: Clear breakdown of transaction details
- **Risk Disclosure**: Mandatory acknowledgment of investment risks

#### Transaction State
- **Processing Indicator**: Clear transaction submission status
- **Blockchain Tracking**: Real-time transaction hash monitoring
- **Timeout Handling**: Network congestion communication
- **Error Recovery**: Clear failure messaging and retry options

#### Post-Transaction State
- **Success Confirmation**: Transaction hash and block confirmation
- **Token Delivery**: Clear explanation of token distribution timing
- **Next Steps**: Guidance on portfolio tracking and project updates
- **Documentation**: Transaction receipt and record keeping

### User Flow Design

#### Activation Triggers
1. **Project Detail**: Investment button on project pages
2. **Grid Quick Action**: Express investment from project cards
3. **Portfolio**: Re-investment or additional investment flows

#### Interaction Patterns
- **Progressive Enhancement**: Basic functionality without JavaScript
- **Keyboard Navigation**: Full accessibility support
- **Mobile Optimization**: Touch-friendly interface design
- **Error Prevention**: Smart validation and user guidance

---

## E. Claim/Apply Interfaces

### Information Architecture

#### Interface Differentiation

**Claim Interface (Failed Projects)**
- **Trigger**: Project funding failure or timeline expiration
- **Access Control**: Limited to project backers only
- **Layout**: Simple, action-focused design with clear messaging

**Apply Interface (Successful Projects)**
- **Trigger**: Successful funding completion
- **Access Control**: Limited to project creators only
- **Layout**: Professional deployment interface with status tracking

### Claim Interface Design

#### Layout Structure
- **Status Header**: Clear explanation of project failure and refund eligibility
- **Amount Display**: Prominent refund amount with transaction details
- **Claim Button**: Large, primary action with progress indication
- **Transaction Status**: Real-time blockchain transaction tracking

#### User Experience Flow
1. **Eligibility Verification**: Automatic validation of refund rights
2. **Amount Calculation**: Clear breakdown of refundable amount
3. **Transaction Execution**: Simple one-click claim process
4. **Confirmation**: Receipt and documentation of refund transaction

### Apply Interface Design

#### Layout Structure
- **Success Celebration**: Positive messaging about funding achievement
- **Deployment Status**: Clear indication of smart contract deployment readiness
- **Apply Button**: Prominent action for creator token deployment
- **Transaction Confirmation**: Professional deployment process tracking

#### User Experience Flow
1. **Success Validation**: Confirmation of funding target achievement
2. **Deployment Preparation**: Smart contract readiness verification
3. **Token Deployment**: One-click deployment with progress tracking
4. **Completion Confirmation**: Success messaging and next steps guidance

### Trust & Transparency Elements
- **Blockchain Verification**: All transactions linked to blockchain explorers
- **Automatic Processing**: Minimal manual intervention required
- **Clear Timelines**: Expected processing times and completion estimates
- **Support Access**: Direct support channel for transaction issues

---

## F. User Dashboard

### Information Architecture

#### Dashboard Structure
- **Header**: User identification, wallet status, key metrics summary
- **Navigation Tabs**: Clear separation between "My Investments" and "My Projects"
- **Content Panels**: Role-specific information with appropriate detail levels
- **Quick Actions**: Contextual actions based on user status and permissions

### My Investments Tab Design

#### Layout Priority

**Primary Section: Active Investments**
- **Investment Cards**: Compact cards showing current investment status
- **Performance Indicators**: Real-time project progress and token value
- **Action Items**: Available actions (claim, track, update) per investment
- **Risk Monitoring**: Status alerts for concerning project developments

**Secondary Section: Claimable Refunds**
- **Refund Queue**: Failed projects with available refunds
- **Amount Summary**: Total claimable amount across all failed projects
- **Batch Claiming**: Option to claim multiple refunds simultaneously
- **Historical Claims**: Record of previously processed refunds

**Tertiary Section: Investment History**
- **Transaction Log**: Complete investment history with blockchain verification
- **Performance Tracking**: Historical returns and portfolio analysis
- **Tax Documentation**: Export capabilities for tax reporting
- **Archive Access**: Access to completed or expired investments

### My Projects Tab Design

#### Creator-Focused Layout

**Primary Section: Project Status Overview**
- **Active Projects**: Current fundraising campaigns with real-time metrics
- **Project Health**: Status indicators for each project's performance
- **Immediate Actions**: Critical actions requiring creator attention
- **Community Metrics**: Backer engagement and community growth indicators

**Secondary Section: Apply Opportunities**
- **Successful Projects**: Projects eligible for token deployment
- **Apply Button Integration**: Direct access to deployment interface
- **Deployment Status**: Progress tracking for ongoing deployments
- **Post-Deployment Management**: Tools for ongoing project management

### User Flow Design

#### Dashboard Entry Points
1. **Platform Header**: Primary navigation access point
2. **Post-Login**: Default landing page for authenticated users
3. **Transaction Completion**: Automatic redirection after investments
4. **Email Notifications**: Direct links to relevant dashboard sections

#### Information Consumption Patterns
- **Quick Status Check**: Rapid overview of all user activities
- **Detailed Investigation**: Drill-down into specific investments or projects
- **Action Completion**: Efficient task completion with minimal navigation
- **Historical Analysis**: Long-term performance and activity review

---

## Responsive Design Considerations

### Mobile-First Approach

#### Breakpoint Strategy
- **Mobile**: 320-768px (Single column, simplified navigation)
- **Tablet**: 769-1024px (Adapted two-column, touch-optimized)
- **Desktop**: 1025px+ (Full multi-column layout with enhanced features)

#### Mobile Optimizations
- **Progressive Enhancement**: Core functionality accessible on all devices
- **Touch Targets**: Minimum 44px touch targets for all interactive elements
- **Simplified Navigation**: Collapsible menus and streamlined user flows
- **Performance**: Optimized loading and reduced data usage

### Cross-Platform Consistency
- **Visual Language**: Consistent design patterns across all devices
- **Interaction Models**: Adapted but predictable user interactions
- **Information Hierarchy**: Maintained importance levels across breakpoints
- **Feature Parity**: Core functionality available regardless of device

---

## Error States & Validation Feedback

### Validation Strategy

#### Progressive Validation
- **Input Level**: Real-time validation as users interact with fields
- **Section Level**: Validation summaries at form section completion
- **Submission Level**: Comprehensive validation before final submission
- **Network Level**: Blockchain and network-specific validations

#### Error Communication Patterns
- **Inline Errors**: Immediate feedback next to relevant form fields
- **Summary Errors**: Consolidated error lists for complex form submissions
- **Contextual Help**: Proactive guidance to prevent common errors
- **Recovery Guidance**: Clear next steps for error resolution

### Error State Design

#### Visual Error Hierarchy
- **Critical Errors**: Red indicators for blocking issues
- **Warning States**: Yellow indicators for concerning but non-blocking issues
- **Information States**: Blue indicators for helpful guidance
- **Success States**: Green indicators for completed validations

#### Error Recovery Flows
- **Automatic Recovery**: System-initiated recovery where possible
- **Guided Recovery**: Step-by-step user guidance for manual recovery
- **Support Escalation**: Clear paths to human support for complex issues
- **Documentation**: Error logging for continuous improvement

---

## Trust Signals & Transparency Features

### Security Indicators

#### Visual Trust Elements
- **Verification Badges**: Clear indicators for verified projects and creators
- **Security Audits**: Prominent display of completed security assessments
- **Blockchain Verification**: Links to blockchain explorers for transaction verification
- **Insurance Status**: Display of any insurance coverage or protection mechanisms

#### Transparency Features
- **Open Source**: Links to open-source code repositories where applicable
- **Team Information**: Verified team member profiles and backgrounds
- **Financial Transparency**: Clear fund usage and allocation reporting
- **Community Governance**: Transparent decision-making processes

### Regulatory Compliance

#### Compliance Indicators
- **Legal Status**: Clear indication of regulatory compliance status
- **Jurisdiction**: Explicit disclosure of applicable legal jurisdictions
- **Investor Protections**: Clear explanation of available investor protections
- **Risk Disclosures**: Comprehensive risk factor communication

#### Documentation Access
- **Terms of Service**: Easily accessible and clearly written terms
- **Privacy Policy**: Transparent data handling and privacy practices
- **Regulatory Filings**: Access to any required regulatory documentation
- **Legal Resources**: Educational resources about investor rights and responsibilities

---

This comprehensive feature requirements and wireframe specification provides the foundation for building a user-centered Dico platform that addresses the specific needs, concerns, and decision-making processes of all user personas while maintaining the highest standards of trust, transparency, and usability.