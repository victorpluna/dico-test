// Project-related TypeScript type definitions

// Base project interface
export interface Project {
  id: string
  name: string
  description?: string
  logo?: string
  whitepaperUrl: string
  projectPlanUrl: string
  smartContractCode: string
  smartContractAddress?: string
  tokenomics: Tokenomics
  funding: FundingDetails
  timeline: Timeline
  creator: ProjectCreator
  status: ProjectStatus
  verification: VerificationStatus
  backers: Backer[]
  updates: ProjectUpdate[]
  createdAt: Date
  updatedAt: Date
}

// Project funding details
export interface FundingDetails {
  currentAmount: number // ETH amount currently raised
  targetAmount: number // ETH target funding amount
  ownFunding: number // Creator's own investment
  fundingAddress: string // Ethereum address for receiving funds
  minimumInvestment?: number // Minimum investment amount
  maximumInvestment?: number // Maximum investment amount
}

// Project timeline
export interface Timeline {
  startDate: Date
  endDate: Date
  milestones: Milestone[]
}

// Project milestones
export interface Milestone {
  id: string
  percentage: number // Funding percentage trigger (25, 50, 75, 100)
  title: string
  description: string
  reached: boolean
  reachedAt?: Date
}

// Project creator information
export interface ProjectCreator {
  id: string
  name: string
  email: string
  walletAddress: string
  avatar?: string
  verified: boolean
  reputation?: number
  previousProjects?: string[] // Array of project IDs
}

// Project backer information
export interface Backer {
  id: string
  walletAddress: string
  investmentAmount: number
  investedAt: Date
  anonymous?: boolean
  name?: string // Optional if not anonymous
}

// Project status enum
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  FUNDED = 'funded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

// Verification status
export interface VerificationStatus {
  verified: boolean
  verifiedAt?: Date
  verificationLevel: 'basic' | 'standard' | 'premium'
  badges: VerificationBadge[]
}

// Verification badges
export interface VerificationBadge {
  type: 'whitepaper' | 'smart_contract' | 'team' | 'legal' | 'audit'
  verified: boolean
  verifiedAt?: Date
  details?: string
}

// Project updates
export interface ProjectUpdate {
  id: string
  title: string
  content: string
  type: 'general' | 'milestone' | 'funding' | 'technical'
  publishedAt: Date
  author: string // Creator ID
}

// Tokenomics information
export interface Tokenomics {
  totalSupply: number
  distribution: TokenDistribution[]
  vestingSchedule?: VestingSchedule[]
  tokenStandard: 'ERC-20' | 'ERC-721' | 'ERC-1155'
  tokenSymbol: string
  tokenName: string
}

// Token distribution
export interface TokenDistribution {
  category: 'public_sale' | 'team' | 'development' | 'marketing' | 'reserve' | 'advisors'
  percentage: number
  amount: number
  lockupPeriod?: number // in months
}

// Vesting schedule
export interface VestingSchedule {
  beneficiary: 'team' | 'advisors' | 'investors'
  cliffPeriod: number // in months
  vestingDuration: number // in months
  releasePercentage: number
}

// Time remaining interface
export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Urgency levels for countdown timer
export type UrgencyLevel = 'healthy' | 'warning' | 'critical'

// Component Props Interfaces

// ProjectCard component props
export interface ProjectCardProps {
  projectName: string
  logo?: string
  currentFunding: number
  targetFunding: number
  timeRemaining: Omit<TimeRemaining, 'seconds'>
  ownFunding: number
  backers: number
  verified: boolean
  lastUpdated: string
  onCardClick?: () => void
  cardIndex?: number
  className?: string
}

// ProjectForm component props and related types
export interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  onSubmit?: (data: ProjectFormData) => void
  onSave?: (data: Partial<ProjectFormData>) => void
  className?: string
}

export interface ProjectFormData {
  projectName: string
  whitepaperUrl: string
  projectPlanUrl: string
  smartContractCode: string
  ownFunding: number
  targetFunding: number
  fundingAddress: string
}

export interface FormValidationState {
  field: string
  status: 'idle' | 'validating' | 'valid' | 'error'
  message?: string
}

export type FormStep = 1 | 2 | 3 | 4 | 5

export interface StepConfig {
  title: string
  description: string
  fields: (keyof ProjectFormData)[]
}

// ProgressBar component props
export interface ProgressBarProps {
  currentAmount: number
  targetAmount: number
  creatorStake: number
  backers: number
  lastUpdated: string
  className?: string
  height?: 'thin' | 'base' | 'thick'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple'
  showTransparency?: boolean
  showMilestones?: boolean
  animated?: boolean
  milestones?: ProgressMilestone[]
}

export interface ProgressMilestone {
  percentage: number
  label: string
  reached: boolean
  reachedAt?: Date
}

// CountdownTimer component props
export interface CountdownTimerProps {
  endDate: Date
  size?: 'small' | 'base' | 'large'
  format?: 'inline' | 'block' | 'compact'
  showSeconds?: boolean
  className?: string
  onComplete?: () => void
  onUrgencyChange?: (level: UrgencyLevel) => void
}

// Animation and styling types
export interface AnimationConfig {
  duration: number
  ease: number[]
  delay?: number
  repeat?: number
}

export interface SizeConfig {
  containerClass: string
  numberClass: string
  unitClass: string
  separatorClass: string
  labelClass: string
}

export interface UrgencyColorConfig {
  bg: string
  text: string
  border: string
  dot: string
  label: string
}

// API related types
export interface CreateProjectRequest {
  projectData: ProjectFormData
  creatorAddress: string
  signature: string
}

export interface CreateProjectResponse {
  success: boolean
  projectId?: string
  error?: string
}

export interface GetProjectResponse {
  success: boolean
  project?: Project
  error?: string
}

export interface InvestInProjectRequest {
  projectId: string
  amount: number // ETH amount
  investorAddress: string
  transactionHash: string
}

export interface InvestInProjectResponse {
  success: boolean
  investmentId?: string
  error?: string
}

// Web3 integration types
export interface Web3ContextType {
  isConnected: boolean
  address?: string
  chainId?: number
  balance?: number
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork?: (chainId: number) => Promise<void>
}

export interface ContractConfig {
  address: string
  abi: any[]
  chainId: number
}

// Error types
export interface FormError {
  field: keyof ProjectFormData
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormError[]
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Event types
export interface ProjectCreatedEvent {
  projectId: string
  creator: string
  targetFunding: number
  timestamp: Date
}

export interface FundingReceivedEvent {
  projectId: string
  investor: string
  amount: number
  totalRaised: number
  timestamp: Date
}

export interface MilestoneReachedEvent {
  projectId: string
  milestone: Milestone
  timestamp: Date
}

export interface ProjectCompletedEvent {
  projectId: string
  totalRaised: number
  backerCount: number
  timestamp: Date
}

// Hook types
export interface UseProjectReturn {
  project?: Project
  loading: boolean
  error?: string
  refetch: () => void
}

export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error?: string
  hasMore: boolean
  loadMore: () => void
  refetch: () => void
}

export interface UseCountdownReturn {
  timeRemaining: TimeRemaining
  urgencyLevel: UrgencyLevel
  isComplete: boolean
  percentageComplete: number
}

// Filter and sort types
export interface ProjectFilters {
  status?: ProjectStatus[]
  verified?: boolean
  minFunding?: number
  maxFunding?: number
  category?: string[]
  creator?: string
  search?: string
}

export interface ProjectSortOptions {
  field: 'createdAt' | 'fundingRatio' | 'timeRemaining' | 'popularity'
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
}

// Constants
export const FORM_STEPS: Record<FormStep, StepConfig> = {
  1: {
    title: 'Project Documentation',
    description: 'Provide essential documents that establish trust and credibility',
    fields: ['projectName', 'whitepaperUrl', 'projectPlanUrl']
  },
  2: {
    title: 'Technical Implementation',
    description: 'Provide your smart contract code and technical specifications',
    fields: ['smartContractCode']
  },
  3: {
    title: 'Economic Model',
    description: 'Define your tokenomics and economic structure',
    fields: []
  },
  4: {
    title: 'Funding Structure',
    description: 'Set your funding goals and demonstrate commitment',
    fields: ['ownFunding', 'targetFunding', 'fundingAddress']
  },
  5: {
    title: 'Preview & Review',
    description: 'Review your project before submission',
    fields: []
  }
}

export const MILESTONE_PERCENTAGES = [25, 50, 75, 100] as const

export const URGENCY_THRESHOLDS = {
  HEALTHY: 720, // hours (30 days)
  WARNING: 168  // hours (7 days)
} as const