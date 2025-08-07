# State Management Architecture - DICO Platform

## Overview

The DICO Platform uses **Zustand** as its primary state management solution, organized into multiple specialized stores that handle different aspects of the application state. This document outlines the architecture, patterns, and best practices for state management across the platform.

## Architecture Overview

### Store Structure

The state management is divided into four main stores:

1. **Project Store** - Manages project data, search, filtering, and drafts
2. **Investment Store** - Handles user investments, portfolio metrics, and claiming
3. **User Store** - Manages user preferences, wallet state, and notifications
4. **UI Store** - Controls modal states, loading states, and error handling

### Key Benefits

- **Modularity**: Each store handles a specific domain
- **Performance**: Selective subscriptions prevent unnecessary re-renders
- **Persistence**: User preferences and drafts are automatically saved
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Devtools**: Integration with Redux DevTools for debugging

## Store Details

### Project Store (`projectStore.ts`)

**Purpose**: Manages all project-related data and operations.

**Key Features**:
- Project CRUD operations
- Search and filtering with persistence
- Draft management with auto-save
- Caching for performance optimization
- Sorting and pagination

**State Structure**:
```typescript
interface ProjectState {
  // Project lists
  projects: Project[]
  featuredProjects: Project[]
  userCreatedProjects: Project[]
  projectsById: Record<string, Project>
  
  // Search and filter state
  searchQuery: string
  filters: ProjectFilters
  sortOptions: ProjectSortOptions
  pagination: PaginationOptions
  
  // Draft management
  projectDraft: Partial<ProjectFormData> | null
  draftAutoSaveEnabled: boolean
  lastAutoSave: Date | null
  
  // Loading and error states
  loading: boolean
  error: string | null
}
```

**Key Actions**:
- `fetchProjects()` - Load projects with filtering/sorting
- `createProject()` - Create new project
- `saveDraft()` - Auto-save form drafts
- `setSearchQuery()` - Update search with debouncing
- `setFilters()` - Apply project filters
- `invalidateCache()` - Clear cached data

**Usage Example**:
```typescript
import { useProjectStore, projectSelectors } from '@/lib/store'

function ProjectList() {
  const { 
    projects, 
    loading, 
    searchQuery, 
    setSearchQuery,
    fetchProjects 
  } = useProjectStore()
  
  const filteredProjects = useProjectStore(projectSelectors.filteredProjects)
  
  useEffect(() => {
    fetchProjects()
  }, [])
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects..."
      />
      {filteredProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### Investment Store (`investmentStore.ts`)

**Purpose**: Manages user investments, portfolio metrics, and token claiming.

**Key Features**:
- Investment tracking and history
- Portfolio performance calculations
- Claimable token management
- Vesting schedule tracking
- Transaction state management

**State Structure**:
```typescript
interface InvestmentState {
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
```

**Key Actions**:
- `addInvestment()` - Add new investment
- `claimTokens()` - Claim vested tokens
- `refreshPortfolioMetrics()` - Update portfolio calculations
- `fetchUserInvestments()` - Load user's investments
- `calculateClaimableAmount()` - Calculate available tokens

**Usage Example**:
```typescript
import { useInvestmentStore, investmentSelectors } from '@/lib/store'

function Portfolio() {
  const { portfolioMetrics, claimTokens } = useInvestmentStore()
  const claimableInvestments = useInvestmentStore(
    investmentSelectors.claimableInvestments
  )
  
  const handleClaim = async (investmentId: string) => {
    await claimTokens(investmentId)
  }
  
  return (
    <div>
      <h2>Portfolio Value: {portfolioMetrics.totalValue} ETH</h2>
      <p>ROI: {portfolioMetrics.roi.toFixed(2)}%</p>
      
      {claimableInvestments.map(investment => (
        <div key={investment.id}>
          <span>{investment.claimableAmount} tokens available</span>
          <button onClick={() => handleClaim(investment.id)}>
            Claim Tokens
          </button>
        </div>
      ))}
    </div>
  )
}
```

### User Store (`userStore.ts`)

**Purpose**: Manages user preferences, wallet state, and notifications.

**Key Features**:
- Wallet connection state sync
- User preferences with persistence
- Notification management
- Theme management
- Profile management

**State Structure**:
```typescript
interface UserState {
  // Wallet connection
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
```

**Key Actions**:
- `setWalletConnection()` - Update wallet state
- `updatePreferences()` - Save user preferences
- `addNotification()` - Add new notification
- `updateProfile()` - Update user profile
- `markNotificationRead()` - Mark notification as read

**Utility Hooks**:
```typescript
// Theme management
const { theme, setTheme } = useTheme()

// Notifications
const { 
  notifications, 
  unreadCount, 
  addNotification,
  markNotificationRead 
} = useNotifications()
```

**Usage Example**:
```typescript
import { useUserStore, useTheme, useNotifications } from '@/lib/store'

function UserProfile() {
  const { isConnected, profile, updateProfile } = useUserStore()
  const { theme, setTheme } = useTheme()
  const { addNotification } = useNotifications()
  
  const handleSaveProfile = async (data: ProfileData) => {
    try {
      await updateProfile(data)
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been saved successfully.'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save profile changes.'
      })
    }
  }
  
  if (!isConnected) {
    return <WalletConnect />
  }
  
  return (
    <div>
      <ProfileForm 
        initialData={profile}
        onSave={handleSaveProfile}
      />
      <ThemeSelector 
        current={theme}
        onChange={setTheme}
      />
    </div>
  )
}
```

### UI Store (`uiStore.ts`)

**Purpose**: Manages UI state, modals, loading states, and error handling.

**Key Features**:
- Modal state management
- Loading state tracking
- Error state handling
- Form validation state
- Toast notifications

**State Structure**:
```typescript
interface UIState {
  // Modal states
  modals: ModalState
  
  // Loading states
  loading: LoadingState
  
  // Error states
  errors: ErrorState
  
  // Form validation states
  formValidation: FormValidationState
  
  // Toast notifications
  toasts: Toast[]
  
  // UI preferences
  sidebarCollapsed: boolean
  showAdvancedFilters: boolean
}
```

**Utility Hooks**:
```typescript
// Modal management
const { modal, show, hide } = useModal('investModal')

// Loading states
const isLoading = useLoading('projects')

// Toast notifications
const { toast } = useToast()

// Form validation
const { setField, clearForm, formErrors, isValid } = useFormValidation('login-form')
```

**Usage Example**:
```typescript
import { useUIStore, useModal, useToast } from '@/lib/store'

function InvestmentButton({ projectId, projectAddress }) {
  const { show } = useModal('investModal')
  const { toast } = useToast()
  
  const handleInvest = () => {
    if (!projectAddress) {
      toast.error('Invalid project address')
      return
    }
    
    show(projectId, projectAddress)
  }
  
  return (
    <button onClick={handleInvest}>
      Invest Now
    </button>
  )
}
```

## Global Actions and Coordination

The store architecture includes global actions that coordinate between multiple stores:

### `globalActions.initializeApp()`
- Initializes app with user data
- Loads projects and investments
- Sets up initial state

### `globalActions.connectWallet()`
- Handles wallet connection
- Fetches user-specific data
- Shows success notifications

### `globalActions.createProject()`
- Creates new project
- Clears form drafts
- Shows success feedback

### `globalActions.makeInvestment()`
- Processes investment
- Updates portfolio
- Shows transaction status

## Selectors for Performance

Selectors provide optimized access to derived state:

```typescript
// Project selectors
const filteredProjects = useProjectStore(projectSelectors.filteredProjects)
const projectById = useProjectStore(projectSelectors.projectById('123'))

// Investment selectors  
const claimableInvestments = useInvestmentStore(
  investmentSelectors.claimableInvestments
)

// UI selectors
const hasErrors = useUIStore(uiSelectors.hasErrors)
const isLoading = useUIStore(uiSelectors.isLoading)
```

## Persistence Strategy

### Persisted Data
- User preferences and settings
- Notification settings
- Recent notifications (limited)
- Project form drafts

### Non-Persisted Data
- Project lists (refreshed on load)
- Investment data (fetched from blockchain)
- UI state (modal states, loading states)
- Error states

### Configuration
```typescript
const persistConfig = {
  name: 'dico-store',
  storage: 'localStorage',
  whitelist: ['user'], // Only persist user store
  blacklist: ['ui', 'project', 'investment']
}
```

## Best Practices

### 1. Store Organization
- Keep stores focused on single domains
- Use consistent naming conventions
- Separate actions from state

### 2. Performance Optimization
- Use selectors for computed values
- Subscribe only to needed state slices
- Implement proper equality checks

### 3. Error Handling
- Centralize error state management
- Provide user-friendly error messages
- Implement retry mechanisms

### 4. Type Safety
- Define comprehensive TypeScript types
- Use strict typing for all actions
- Implement proper type guards

### 5. Testing Strategy
- Test store actions and selectors
- Mock store state for components
- Test error scenarios

## Integration Points

### Component Integration
```typescript
// Read from store
const projects = useProjectStore(state => state.projects)

// Use actions
const { createProject, saveDraft } = useProjectStore()

// Use selectors
const filteredProjects = useProjectStore(projectSelectors.filteredProjects)
```

### Form Integration
```typescript
// Auto-save form data
const { saveDraft, loadDraft } = useProjectStore()
const { setField, formErrors } = useFormValidation('project-form')

useEffect(() => {
  const draft = loadDraft()
  if (draft) setFormData(draft)
}, [])

useEffect(() => {
  const timer = setTimeout(() => saveDraft(formData), 2000)
  return () => clearTimeout(timer)
}, [formData])
```

### API Integration
```typescript
// Optimistic updates
const updateProject = async (id: string, data: ProjectUpdate) => {
  // Update store immediately
  set(draft => {
    const project = draft.projectsById[id]
    if (project) Object.assign(project, data)
  })
  
  try {
    // Call API
    await api.updateProject(id, data)
  } catch (error) {
    // Revert on error
    set(draft => {
      // Revert changes
    })
    throw error
  }
}
```

## Debugging and Development

### DevTools Integration
- Redux DevTools support
- Action logging in development
- State snapshots for debugging

### Debugging Utilities
```typescript
// Get state snapshot
const snapshot = storeUtils.getStateSnapshot()

// Subscribe to all changes
const unsubscribe = storeUtils.subscribeToAllChanges(
  (storeName, state) => console.log(storeName, state)
)

// Calculate store size
const sizes = storeUtils.calculateStoreSize()
```

## Migration and Versioning

### Store Version Management
```typescript
const userStoreConfig = {
  name: 'user-store',
  version: 1,
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // Migrate from v0 to v1
      return {
        ...persistedState,
        preferences: { ...defaultPreferences, ...persistedState.preferences }
      }
    }
    return persistedState
  }
}
```

## Conclusion

This state management architecture provides:

- **Scalability**: Modular stores that can grow independently
- **Performance**: Optimized subscriptions and selective updates
- **Developer Experience**: TypeScript support and debugging tools
- **User Experience**: Persistent preferences and optimistic updates
- **Maintainability**: Clear separation of concerns and consistent patterns

The architecture supports the complex requirements of a DeFi platform while maintaining code quality and developer productivity.