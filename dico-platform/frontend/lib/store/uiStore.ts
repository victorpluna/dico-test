import { create } from 'zustand'
import type { Address } from 'viem'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  createdAt: Date
}

interface SimpleUIState {
  // Toasts
  toasts: Toast[]
  
  // Modals
  investModal: {
    isOpen: boolean
    projectId?: string
    projectAddress?: Address
  }
  
  // Loading states
  loading: {
    global: boolean
    projects: boolean
    investments: boolean
  }
}

interface SimpleUIActions {
  // Toast actions
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Modal actions
  showInvestModal: (projectId: string, projectAddress?: Address) => void
  hideInvestModal: () => void
  
  // Loading actions
  setLoading: (key: keyof SimpleUIState['loading'], value: boolean) => void
}

const initialState: SimpleUIState = {
  toasts: [],
  investModal: {
    isOpen: false
  },
  loading: {
    global: false,
    projects: false,
    investments: false
  }
}

export const useUIStore = create<SimpleUIState & SimpleUIActions>((set, get) => ({
  ...initialState,
  
  // Toast actions
  showToast: (toast) => {
    const newToast: Toast = {
      ...toast,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date()
    }
    
    set((state) => ({
      ...state,
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(newToast.id)
      }, toast.duration || 5000)
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      ...state,
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },
  
  clearToasts: () => {
    set((state) => ({
      ...state,
      toasts: []
    }))
  },
  
  // Modal actions
  showInvestModal: (projectId, projectAddress) => {
    set((state) => ({
      ...state,
      investModal: {
        isOpen: true,
        projectId,
        projectAddress
      }
    }))
  },
  
  hideInvestModal: () => {
    set((state) => ({
      ...state,
      investModal: {
        isOpen: false
      }
    }))
  },
  
  // Loading actions
  setLoading: (key, value) => {
    set((state) => ({
      ...state,
      loading: {
        ...state.loading,
        [key]: value
      }
    }))
  }
}))

// Simple selectors
export const uiSelectors = {
  visibleToasts: (state: SimpleUIState) => state.toasts,
  isLoading: (state: SimpleUIState) => Object.values(state.loading).some(Boolean),
  investModal: (state: SimpleUIState) => state.investModal
}

// Helper hooks
export const useToast = () => {
  const showToast = useUIStore(state => state.showToast)
  
  return {
    toast: showToast,
    showToast
  }
}