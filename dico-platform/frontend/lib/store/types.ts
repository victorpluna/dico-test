// Store-related TypeScript type definitions
import { Project, ProjectFilters, ProjectSortOptions, PaginationOptions, ProjectFormData } from '@/components/project/types'
import type { Address } from 'viem'

// =============================================================================
// PROJECT STORE TYPES
// =============================================================================

export interface ProjectState {
  // Project lists
  projects: Project[]
  featuredProjects: Project[]
  userCreatedProjects: Project[]
  
  // Project details cache for performance
  projectsById: Record<string, Project>
  
  // Search and filter state
  searchQuery: string
  filters: ProjectFilters
  sortOptions: ProjectSortOptions
  pagination: PaginationOptions
  
  // Loading and error states
  loading: boolean
  error: string | null
  
  // Draft management
  projectDraft: Partial<ProjectFormData> | null
  draftAutoSaveEnabled: boolean
  lastAutoSave: Date | null
}

export interface ProjectActions {
  // Project CRUD operations
  fetchProjects: (params?: ProjectFetchParams) => Promise<void>
  fetchProjectById: (id: string) => Promise<Project | null>
  createProject: (data: ProjectFormData) => Promise<string | null>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  // Search and filtering
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<ProjectFilters>) => void
  setSortOptions: (sort: ProjectSortOptions) => void
  setPagination: (pagination: Partial<PaginationOptions>) => void
  clearFilters: () => void
  
  // Draft management
  saveDraft: (data: Partial<ProjectFormData>) => void
  loadDraft: () => Partial<ProjectFormData> | null
  clearDraft: () => void
  enableAutoSave: () => void
  disableAutoSave: () => void
  
  // Cache management
  invalidateCache: (projectId?: string) => void
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

export interface ProjectFetchParams {
  page?: number
  limit?: number
  filters?: ProjectFilters
  sort?: ProjectSortOptions
  featured?: boolean
}

// =============================================================================
// INVESTMENT STORE TYPES
// =============================================================================

export interface Investment {
  id: string
  projectId: string
  investorAddress: Address
  amount: number // ETH amount
  tokenAmount: number // Expected tokens
  transactionHash: string
  status: InvestmentStatus
  createdAt: Date
  updatedAt: Date
  vestingSchedule?: VestingSchedule[]
  claimableAmount?: number
}

export enum InvestmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface VestingSchedule {
  releaseDate: Date
  amount: number
  claimed: boolean
  claimedAt?: Date
}

export interface PortfolioMetrics {
  totalInvested: number
  totalValue: number // Current portfolio value
  totalGains: number
  totalLosses: number
  roi: number // Return on investment percentage
  activeInvestments: number
  completedInvestments: number
  claimableAmount: number
}

export interface InvestmentState {
  // User investments
  investments: Investment[]
  investmentsById: Record<string, Investment>
  
  // Portfolio metrics
  portfolioMetrics: PortfolioMetrics
  
  // Transaction states
  pendingTransactions: Record<string, TransactionState>
  
  // Loading states
  loading: boolean
  error: string | null
}

export interface InvestmentActions {
  // Investment operations
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInvestment: (id: string, updates: Partial<Investment>) => void
  removeInvestment: (id: string) => void
  
  // Fetch operations
  fetchUserInvestments: (address: Address) => Promise<void>
  fetchInvestmentById: (id: string) => Promise<Investment | null>
  
  // Claiming operations
  calculateClaimableAmount: (investmentId: string) => number
  claimTokens: (investmentId: string) => Promise<void>
  
  // Portfolio operations
  refreshPortfolioMetrics: () => void
  
  // Transaction management
  setTransactionState: (txId: string, state: TransactionState) => void
  clearTransactionState: (txId: string) => void
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'error'
  message: string
  transactionHash?: string
  error?: string
}

// =============================================================================
// USER STORE TYPES
// =============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultProjectSort: ProjectSortOptions
  defaultProjectFilters: ProjectFilters
  showOnlyVerified: boolean
  enableNotifications: boolean
  autoSaveInterval: number // minutes
  displayCurrency: 'ETH' | 'USD'
  investmentWarningsEnabled: boolean
}

export interface NotificationSettings {
  projectUpdates: boolean
  investmentAlerts: boolean
  newProjectAlerts: boolean
  milestoneAlerts: boolean
  emailNotifications: boolean
}

export interface UserState {
  // Wallet connection (synced with wagmi)
  isConnected: boolean
  address: Address | null
  chainId: number | null
  balance: number | null
  
  // User preferences
  preferences: UserPreferences
  notificationSettings: NotificationSettings
  
  // User profile data
  profile: UserProfile | null
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
}

export interface UserProfile {
  address: Address
  ensName?: string
  avatar?: string
  bio?: string
  website?: string
  twitter?: string
  discord?: string
  verified: boolean
  createdAt: Date
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export interface UserActions {
  // Wallet operations
  setWalletConnection: (connected: boolean, address?: Address, chainId?: number) => void
  setBalance: (balance: number) => void
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  resetPreferences: () => void
  
  // Profile operations
  updateProfile: (profile: Partial<UserProfile>) => void
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// =============================================================================
// UI STORE TYPES
// =============================================================================

export interface ModalState {
  investModal: {
    isOpen: boolean
    projectId: string | null
    projectAddress: Address | null
  }
  confirmationModal: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: (() => void) | null
    onCancel: (() => void) | null
  }
  walletModal: {
    isOpen: boolean
  }
  projectModal: {
    isOpen: boolean
    projectId: string | null
  }
}

export interface LoadingState {
  global: boolean
  projects: boolean
  investments: boolean
  transactions: Record<string, boolean>
}

export interface ErrorState {
  global: string | null
  projects: string | null
  investments: string | null
  forms: Record<string, string>
  transactions: Record<string, string>
}

export interface FormValidationState {
  [formId: string]: {
    [fieldName: string]: {
      status: 'idle' | 'validating' | 'valid' | 'error'
      message?: string
    }
  }
}

export interface UIState {
  // Modal states
  modals: ModalState
  
  // Loading states
  loading: LoadingState
  
  // Error states
  errors: ErrorState
  
  // Form validation states
  formValidation: FormValidationState
  
  // UI preferences
  sidebarCollapsed: boolean
  showAdvancedFilters: boolean
  
  // Toast notifications
  toasts: Toast[]
}

export interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  createdAt: Date
}

export interface UIActions {
  // Modal actions
  showInvestModal: (projectId: string, projectAddress: Address) => void
  hideInvestModal: () => void
  showConfirmationModal: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void
  hideConfirmationModal: () => void
  showWalletModal: () => void
  hideWalletModal: () => void
  showProjectModal: (projectId: string) => void
  hideProjectModal: () => void
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void
  setProjectsLoading: (loading: boolean) => void
  setInvestmentsLoading: (loading: boolean) => void
  setTransactionLoading: (txId: string, loading: boolean) => void
  
  // Error actions
  setGlobalError: (error: string | null) => void
  setProjectsError: (error: string | null) => void
  setInvestmentsError: (error: string | null) => void
  setFormError: (formId: string, error: string | null) => void
  setTransactionError: (txId: string, error: string | null) => void
  clearAllErrors: () => void
  
  // Form validation actions
  setFieldValidation: (formId: string, fieldName: string, status: 'idle' | 'validating' | 'valid' | 'error', message?: string) => void
  clearFormValidation: (formId: string) => void
  
  // UI preference actions
  toggleSidebar: () => void
  toggleAdvancedFilters: () => void
  
  // Toast actions
  showToast: (type: 'info' | 'success' | 'warning' | 'error', title: string, message?: string, duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// =============================================================================
// COMBINED STORE TYPES
// =============================================================================

export interface RootStore {
  project: ProjectState & ProjectActions
  investment: InvestmentState & InvestmentActions
  user: UserState & UserActions
  ui: UIState & UIActions
}

// Store persistence configuration
export interface PersistConfig {
  name: string
  version: number
  partialize?: (state: any) => any
  migrate?: (persistedState: any, version: number) => any
}

// Store middleware types
export interface StoreMiddleware {
  onStateChange?: (state: RootStore, prevState: RootStore) => void
  onError?: (error: Error) => void
  devtools?: boolean
}

// Computed state types (derived state)
export interface ComputedState {
  // Project computed values
  filteredProjects: Project[]
  projectCount: number
  hasMoreProjects: boolean
  
  // Investment computed values
  portfolioSummary: {
    totalValue: number
    totalInvested: number
    unrealizedGains: number
    realizedGains: number
  }
  
  // UI computed values
  hasErrors: boolean
  isLoading: boolean
}

// Action payload types
export interface ActionPayload<T = any> {
  type: string
  payload: T
  meta?: {
    timestamp: number
    user?: Address
  }
}

// Store selectors for optimized re-renders
export interface StoreSelectors {
  // Project selectors
  selectFilteredProjects: (filters?: ProjectFilters) => Project[]
  selectProjectById: (id: string) => Project | null
  selectUserProjects: (address: Address) => Project[]
  
  // Investment selectors
  selectUserInvestments: (address: Address) => Investment[]
  selectInvestmentsByProject: (projectId: string) => Investment[]
  selectClaimableInvestments: () => Investment[]
  
  // UI selectors
  selectActiveModal: () => keyof ModalState | null
  selectFormErrors: (formId: string) => Record<string, string>
  selectLoadingStates: () => string[]
}

// Store configuration
export interface StoreConfig {
  persist: {
    enabled: boolean
    storage: 'localStorage' | 'sessionStorage' | 'indexedDB'
    key: string
    whitelist: string[]
    blacklist: string[]
  }
  devtools: {
    enabled: boolean
    name: string
  }
  middleware: {
    logger: boolean
    immer: boolean
    subscriptions: boolean
  }
}