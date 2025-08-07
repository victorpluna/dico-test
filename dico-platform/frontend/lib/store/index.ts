// Main store index - combines all store slices and provides global store access
import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Import all store types
import type { RootStore, StoreConfig } from './types'

// Import individual stores
import { useProjectStore, projectSelectors } from './projectStore'
import { useInvestmentStore, investmentSelectors } from './investmentStore'
import { useUserStore, userSelectors, useTheme, useNotifications } from './userStore'
import { useUIStore, uiSelectors, useToast } from './uiStore'

// Export all individual stores for direct access
export { 
  useProjectStore, 
  useInvestmentStore, 
  useUserStore, 
  useUIStore 
}

// Export all selectors
export { 
  projectSelectors, 
  investmentSelectors, 
  userSelectors, 
  uiSelectors 
}

// Export utility hooks
export { 
  useTheme, 
  useNotifications, 
  useModal, 
  useLoading, 
  useToast, 
  useFormValidation 
}

// Store configuration
const storeConfig: StoreConfig = {
  persist: {
    enabled: true,
    storage: 'localStorage',
    key: 'dico-store',
    whitelist: ['user'], // Only persist user store
    blacklist: ['ui', 'project', 'investment'] // Don't persist UI, project, or investment state
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    name: 'DICO Platform Store'
  },
  middleware: {
    logger: process.env.NODE_ENV === 'development',
    immer: true,
    subscriptions: true
  }
}

// Combined store for accessing all stores from one place
export const useStore = () => ({
  project: useProjectStore(),
  investment: useInvestmentStore(),
  user: useUserStore(),
  ui: useUIStore()
})

// Store subscription helpers
export const subscribeToStore = {
  // Subscribe to project changes
  projects: (callback: (projects: any[]) => void) => {
    return useProjectStore.subscribe(
      (state) => state.projects,
      callback,
      { equalityFn: (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id) }
    )
  },
  
  // Subscribe to investment changes
  investments: (callback: (investments: any[]) => void) => {
    return useInvestmentStore.subscribe(
      (state) => state.investments,
      callback,
      { equalityFn: (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id) }
    )
  },
  
  // Subscribe to user wallet connection
  walletConnection: (callback: (isConnected: boolean, address?: string) => void) => {
    return useUserStore.subscribe(
      (state) => ({ isConnected: state.isConnected, address: state.address }),
      ({ isConnected, address }) => callback(isConnected, address || undefined),
      { equalityFn: (a, b) => a.isConnected === b.isConnected && a.address === b.address }
    )
  },
  
  // Subscribe to UI loading state
  loading: (callback: (isLoading: boolean) => void) => {
    return useUIStore.subscribe(
      (state) => uiSelectors.isLoading(state),
      callback
    )
  }
}

// Global store actions for complex operations that span multiple stores
export const globalActions = {
  // Initialize app with user data
  initializeApp: async () => {
    const userState = useUserStore.getState()
    const projectState = useProjectStore.getState()
    const uiState = useUIStore.getState()
    
    if (userState.isConnected && userState.address) {
      try {
        uiState.setGlobalLoading(true)
        
        // Fetch user investments
        await useInvestmentStore.getState().fetchUserInvestments(userState.address)
        
        // Fetch featured projects
        await projectState.fetchProjects({ featured: true })
        
        // Fetch regular projects
        await projectState.fetchProjects()
        
      } catch (error) {
        uiState.setGlobalError('Failed to initialize app')
        console.error('App initialization error:', error)
      } finally {
        uiState.setGlobalLoading(false)
      }
    } else {
      // Just fetch featured projects for anonymous users
      try {
        await projectState.fetchProjects({ featured: true })
        await projectState.fetchProjects()
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }
  },
  
  // Handle wallet connection
  connectWallet: async (address: string, chainId: number) => {
    const userState = useUserStore.getState()
    const investmentState = useInvestmentStore.getState()
    const uiState = useUIStore.getState()
    
    try {
      // Update user store
      userState.setWalletConnection(true, address as any, chainId)
      
      // Fetch user-specific data
      await investmentState.fetchUserInvestments(address as any)
      
      // Show success toast
      uiState.showToast('success', 'Wallet Connected', `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`)
      
    } catch (error) {
      uiState.showToast('error', 'Connection Failed', 'Failed to load user data')
      console.error('Wallet connection error:', error)
    }
  },
  
  // Handle wallet disconnection
  disconnectWallet: () => {
    const userState = useUserStore.getState()
    const investmentState = useInvestmentStore.getState()
    const uiState = useUIStore.getState()
    
    // Clear user data
    userState.setWalletConnection(false)
    
    // Clear investment data
    investmentState.removeInvestment // This would need to be implemented to clear all
    
    // Show disconnect toast
    uiState.showToast('info', 'Wallet Disconnected')
    
    // Hide any open modals
    uiState.hideInvestModal()
    uiState.hideWalletModal()
  },
  
  // Handle project creation
  createProject: async (projectData: any) => {
    const projectState = useProjectStore.getState()
    const uiState = useUIStore.getState()
    const userState = useUserStore.getState()
    
    try {
      if (!userState.isConnected || !userState.address) {
        throw new Error('Wallet not connected')
      }
      
      uiState.setGlobalLoading(true)
      
      const projectId = await projectState.createProject(projectData)
      
      if (projectId) {
        uiState.showToast('success', 'Project Created', 'Your project has been submitted for review')
        
        // Add notification
        userState.addNotification({
          type: 'success',
          title: 'Project Created',
          message: 'Your project has been submitted and is pending review.'
        })
        
        return projectId
      } else {
        throw new Error('Failed to create project')
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project'
      uiState.setGlobalError(message)
      uiState.showToast('error', 'Creation Failed', message)
      throw error
    } finally {
      uiState.setGlobalLoading(false)
    }
  },
  
  // Handle investment
  makeInvestment: async (projectId: string, projectAddress: string, amount: string) => {
    const investmentState = useInvestmentStore.getState()
    const uiState = useUIStore.getState()
    const userState = useUserStore.getState()
    
    try {
      if (!userState.isConnected || !userState.address) {
        throw new Error('Wallet not connected')
      }
      
      const investment = {
        projectId,
        investorAddress: userState.address,
        amount: parseFloat(amount),
        tokenAmount: parseFloat(amount) * 1000, // Mock calculation
        transactionHash: '0x' + Math.random().toString(16).substring(2),
        status: 'confirmed' as any
      }
      
      investmentState.addInvestment(investment)
      
      // Show success notification
      uiState.showToast('success', 'Investment Successful', `Invested ${amount} ETH`)
      
      // Add user notification
      userState.addNotification({
        type: 'success',
        title: 'Investment Confirmed',
        message: `Your investment of ${amount} ETH has been confirmed.`
      })
      
      // Hide invest modal
      uiState.hideInvestModal()
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Investment failed'
      uiState.showToast('error', 'Investment Failed', message)
      throw error
    }
  },
  
  // Clear all data (for logout or reset)
  clearAllData: () => {
    // Reset all stores to initial state
    useProjectStore.setState({
      projects: [],
      featuredProjects: [],
      userCreatedProjects: [],
      projectsById: {},
      searchQuery: '',
      filters: {
        status: ['active' as any],
        verified: undefined,
        minFunding: undefined,
        maxFunding: undefined,
        category: undefined,
        creator: undefined,
        search: undefined
      },
      sortOptions: {
        field: 'createdAt',
        direction: 'desc'
      },
      pagination: {
        page: 1,
        limit: 12
      },
      loading: false,
      error: null,
      projectDraft: null,
      draftAutoSaveEnabled: true,
      lastAutoSave: null
    })
    
    useInvestmentStore.setState({
      investments: [],
      investmentsById: {},
      portfolioMetrics: {
        totalInvested: 0,
        totalValue: 0,
        totalGains: 0,
        totalLosses: 0,
        roi: 0,
        activeInvestments: 0,
        completedInvestments: 0,
        claimableAmount: 0
      },
      pendingTransactions: {},
      loading: false,
      error: null
    })
    
    useUIStore.setState({
      modals: {
        investModal: { isOpen: false, projectId: null, projectAddress: null },
        confirmationModal: { isOpen: false, title: '', message: '', onConfirm: null, onCancel: null },
        walletModal: { isOpen: false },
        projectModal: { isOpen: false, projectId: null }
      },
      loading: {
        global: false,
        projects: false,
        investments: false,
        transactions: {}
      },
      errors: {
        global: null,
        projects: null,
        investments: null,
        forms: {},
        transactions: {}
      },
      formValidation: {},
      sidebarCollapsed: false,
      showAdvancedFilters: false,
      toasts: []
    })
  }
}

// Performance utilities
export const storeUtils = {
  // Get store state snapshot for debugging
  getStateSnapshot: () => ({
    project: useProjectStore.getState(),
    investment: useInvestmentStore.getState(),
    user: useUserStore.getState(),
    ui: useUIStore.getState()
  }),
  
  // Subscribe to any store changes (for debugging)
  subscribeToAllChanges: (callback: (storeName: string, state: any) => void) => {
    const unsubscribers = [
      useProjectStore.subscribe(() => callback('project', useProjectStore.getState())),
      useInvestmentStore.subscribe(() => callback('investment', useInvestmentStore.getState())),
      useUserStore.subscribe(() => callback('user', useUserStore.getState())),
      useUIStore.subscribe(() => callback('ui', useUIStore.getState()))
    ]
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  },
  
  // Calculate total store size (for memory monitoring)
  calculateStoreSize: () => {
    const snapshot = storeUtils.getStateSnapshot()
    return {
      project: JSON.stringify(snapshot.project).length,
      investment: JSON.stringify(snapshot.investment).length,
      user: JSON.stringify(snapshot.user).length,
      ui: JSON.stringify(snapshot.ui).length,
      total: JSON.stringify(snapshot).length
    }
  }
}

// Export store configuration for external use
export { storeConfig }

// Export types for external use
export type * from './types'
export type { ProjectStore } from './projectStore'
export type { InvestmentStore } from './investmentStore'
export type { UserStore } from './userStore'
export type { UIStore } from './uiStore'

// Default export for convenience
export default {
  useStore,
  globalActions,
  subscribeToStore,
  storeUtils,
  stores: {
    project: useProjectStore,
    investment: useInvestmentStore,
    user: useUserStore,
    ui: useUIStore
  },
  selectors: {
    project: projectSelectors,
    investment: investmentSelectors,
    user: userSelectors,
    ui: uiSelectors
  }
}