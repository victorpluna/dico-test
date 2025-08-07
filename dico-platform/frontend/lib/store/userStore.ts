import { create } from 'zustand'
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Address } from 'viem'
import { ProjectStatus } from '@/components/project/types'
import type { 
  UserState, 
  UserActions, 
  UserPreferences, 
  NotificationSettings, 
  UserProfile, 
  Notification 
} from './types'

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultProjectSort: {
    field: 'createdAt',
    direction: 'desc'
  },
  defaultProjectFilters: {
    status: [ProjectStatus.ACTIVE],
    verified: true
  },
  showOnlyVerified: true,
  enableNotifications: true,
  autoSaveInterval: 2, // minutes
  displayCurrency: 'ETH',
  investmentWarningsEnabled: true
}

// Default notification settings
const defaultNotificationSettings: NotificationSettings = {
  projectUpdates: true,
  investmentAlerts: true,
  newProjectAlerts: false,
  milestoneAlerts: true,
  emailNotifications: false
}

const initialState: UserState = {
  // Wallet connection (synced with wagmi)
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  
  // User preferences
  preferences: defaultPreferences,
  notificationSettings: defaultNotificationSettings,
  
  // User profile data
  profile: null,
  
  // Notifications
  notifications: [],
  unreadCount: 0
}

// Mock API functions (replace with real API calls)
const mockApi = {
  fetchUserProfile: async (address: Address): Promise<UserProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock user profile data
    const mockProfile: UserProfile = {
      address,
      ensName: address === '0x1234567890123456789012345678901234567890' ? 'johndoe.eth' : undefined,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
      bio: 'Blockchain enthusiast and DeFi investor',
      website: 'https://example.com',
      twitter: 'johndoe',
      verified: true,
      createdAt: new Date('2023-01-01')
    }
    
    return mockProfile
  },
  
  updateUserProfile: async (address: Address, updates: Partial<UserProfile>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Mock API call - in real app, this would update the profile on the backend
  },
  
  fetchNotifications: async (address: Address): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        type: 'success',
        title: 'Investment Confirmed',
        message: 'Your investment in DeFi Innovation Protocol has been confirmed!',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        actionUrl: '/dashboard'
      },
      {
        id: 'notif_2',
        type: 'info',
        title: 'Project Milestone Reached',
        message: 'DeFi Innovation Protocol has reached 50% funding!',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        actionUrl: '/project/1'
      },
      {
        id: 'notif_3',
        type: 'warning',
        title: 'Tokens Available to Claim',
        message: 'You have 1,250 DIP tokens available to claim from your investment.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        actionUrl: '/dashboard'
      }
    ]
    
    return mockNotifications
  }
}

// Utility functions
const generateNotificationId = (): string => {
  return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const calculateUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(notif => !notif.read).length
}

// Create the user store with persistence
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          ...initialState,
          
          // Wallet operations
          setWalletConnection: (connected: boolean, address?: Address, chainId?: number) => {
            set((draft) => {
              draft.isConnected = connected
              draft.address = address || null
              draft.chainId = chainId || null
              
              if (!connected) {
                draft.balance = null
                draft.profile = null
              }
            })
            
            // Fetch user profile when wallet connects
            if (connected && address) {
              get().fetchUserProfileAsync(address)
              get().fetchNotificationsAsync(address)
            }
          },
          
          setBalance: (balance: number) => {
            set((draft) => {
              draft.balance = balance
            })
          },
          
          // Preferences
          updatePreferences: (preferences: Partial<UserPreferences>) => {
            set((draft) => {
              draft.preferences = { ...draft.preferences, ...preferences }
            })
          },
          
          updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
            set((draft) => {
              draft.notificationSettings = { ...draft.notificationSettings, ...settings }
            })
          },
          
          resetPreferences: () => {
            set((draft) => {
              draft.preferences = defaultPreferences
              draft.notificationSettings = defaultNotificationSettings
            })
          },
          
          // Profile operations
          updateProfile: (profileUpdates: Partial<UserProfile>) => {
            const state = get()
            
            set((draft) => {
              if (draft.profile) {
                draft.profile = { ...draft.profile, ...profileUpdates }
              }
            })
            
            // Update on backend if connected
            if (state.address) {
              mockApi.updateUserProfile(state.address, profileUpdates).catch(error => {
                console.error('Failed to update profile:', error)
                // Revert optimistic update on error
                set((draft) => {
                  if (draft.profile && state.profile) {
                    // Revert the changes
                    Object.keys(profileUpdates).forEach(key => {
                      if (key in state.profile!) {
                        ;(draft.profile as any)[key] = (state.profile as any)[key]
                      }
                    })
                  }
                })
              })
            }
          },
          
          // Async profile operations (not part of the store interface, but internal)
          fetchUserProfileAsync: async (address: Address) => {
            try {
              const profile = await mockApi.fetchUserProfile(address)
              set((draft) => {
                draft.profile = profile
              })
            } catch (error) {
              console.error('Failed to fetch user profile:', error)
            }
          },
          
          fetchNotificationsAsync: async (address: Address) => {
            try {
              const notifications = await mockApi.fetchNotifications(address)
              set((draft) => {
                draft.notifications = notifications
                draft.unreadCount = calculateUnreadCount(notifications)
              })
            } catch (error) {
              console.error('Failed to fetch notifications:', error)
            }
          },
          
          // Notifications
          addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
            const newNotification: Notification = {
              ...notification,
              id: generateNotificationId(),
              createdAt: new Date(),
              read: false
            }
            
            set((draft) => {
              draft.notifications.unshift(newNotification) // Add to beginning
              draft.unreadCount = calculateUnreadCount(draft.notifications)
              
              // Limit to last 50 notifications to prevent memory issues
              if (draft.notifications.length > 50) {
                draft.notifications = draft.notifications.slice(0, 50)
              }
            })
          },
          
          markNotificationRead: (id: string) => {
            set((draft) => {
              const notification = draft.notifications.find(n => n.id === id)
              if (notification && !notification.read) {
                notification.read = true
                draft.unreadCount = calculateUnreadCount(draft.notifications)
              }
            })
          },
          
          markAllNotificationsRead: () => {
            set((draft) => {
              draft.notifications.forEach(notification => {
                notification.read = true
              })
              draft.unreadCount = 0
            })
          },
          
          removeNotification: (id: string) => {
            set((draft) => {
              draft.notifications = draft.notifications.filter(n => n.id !== id)
              draft.unreadCount = calculateUnreadCount(draft.notifications)
            })
          },
          
          clearNotifications: () => {
            set((draft) => {
              draft.notifications = []
              draft.unreadCount = 0
            })
          }
        }))
      ),
      {
        name: 'user-store',
        version: 1,
        partialize: (state) => ({
          // Only persist user preferences and notifications
          preferences: state.preferences,
          notificationSettings: state.notificationSettings,
          notifications: state.notifications.slice(0, 10), // Only persist recent notifications
          unreadCount: state.unreadCount
        }),
        migrate: (persistedState: any, version: number) => {
          // Handle store version migrations
          if (version === 0) {
            // Migrate from version 0 to 1
            return {
              ...persistedState,
              preferences: { ...defaultPreferences, ...persistedState.preferences },
              notificationSettings: { ...defaultNotificationSettings, ...persistedState.notificationSettings }
            }
          }
          return persistedState
        }
      }
    ),
    {
      name: 'user-store'
    }
  )
)

// Selectors for optimized re-renders
export const userSelectors = {
  // Get wallet info
  walletInfo: (state: UserState & UserActions) => ({
    isConnected: state.isConnected,
    address: state.address,
    chainId: state.chainId,
    balance: state.balance,
    formattedBalance: state.balance ? `${state.balance.toFixed(4)} ETH` : '0.0000 ETH'
  }),
  
  // Get user display info
  userDisplayInfo: (state: UserState & UserActions) => {
    const profile = state.profile
    const address = state.address
    
    if (!address) return null
    
    return {
      displayName: profile?.ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
      avatar: profile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
      verified: profile?.verified || false,
      bio: profile?.bio,
      social: {
        website: profile?.website,
        twitter: profile?.twitter,
        discord: profile?.discord
      }
    }
  },
  
  // Get unread notifications
  unreadNotifications: (state: UserState & UserActions) => {
    return state.notifications.filter(n => !n.read)
  },
  
  // Get recent notifications
  recentNotifications: (limit: number = 5) => (state: UserState & UserActions) => {
    return state.notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  },
  
  // Get notifications by type
  notificationsByType: (type: 'info' | 'success' | 'warning' | 'error') => (state: UserState & UserActions) => {
    return state.notifications.filter(n => n.type === type)
  },
  
  // Get theme preference with system detection
  effectiveTheme: (state: UserState & UserActions) => {
    if (state.preferences.theme !== 'system') {
      return state.preferences.theme
    }
    
    // Detect system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    return 'light'
  },
  
  // Check if notifications are enabled for a type
  isNotificationEnabled: (type: keyof NotificationSettings) => (state: UserState & UserActions) => {
    return state.notificationSettings[type] && state.preferences.enableNotifications
  },
  
  // Get formatted preferences for display
  preferencesDisplay: (state: UserState & UserActions) => {
    const prefs = state.preferences
    return {
      theme: prefs.theme,
      displayCurrency: prefs.displayCurrency,
      autoSave: prefs.autoSaveInterval > 0 ? `Every ${prefs.autoSaveInterval} min` : 'Disabled',
      onlyVerified: prefs.showOnlyVerified ? 'Yes' : 'No',
      notifications: prefs.enableNotifications ? 'Enabled' : 'Disabled',
      investmentWarnings: prefs.investmentWarningsEnabled ? 'Enabled' : 'Disabled'
    }
  }
}

// Export store instance for direct access
export const userStore = useUserStore.getState()

// Export types for external use
export type UserStore = ReturnType<typeof useUserStore>

// Utility hook for theme changes
export const useTheme = () => {
  const theme = useUserStore(userSelectors.effectiveTheme)
  const updatePreferences = useUserStore(state => state.updatePreferences)
  
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme: newTheme })
  }
  
  return { theme, setTheme }
}

// Utility hook for notifications
export const useNotifications = () => {
  const notifications = useUserStore(state => state.notifications)
  const unreadCount = useUserStore(state => state.unreadCount)
  const addNotification = useUserStore(state => state.addNotification)
  const markNotificationRead = useUserStore(state => state.markNotificationRead)
  const markAllNotificationsRead = useUserStore(state => state.markAllNotificationsRead)
  const removeNotification = useUserStore(state => state.removeNotification)
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification
  }
}