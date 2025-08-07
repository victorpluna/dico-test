// SSR Configuration for Zustand stores to prevent hydration errors

export const createSSRConfig = () => {
  // Create a stable server snapshot that matches client initial state
  const getServerSnapshot = () => {
    return JSON.stringify({
      // UI Store initial state
      modals: {
        invest: { isOpen: false, data: null },
        wallet: { isOpen: false, data: null },
        confirmation: { isOpen: false, data: null }
      },
      loading: {
        global: false,
        projects: false,
        investments: false,
        user: false,
        transactions: false
      },
      errors: {
        global: null,
        projects: null,
        investments: null,
        user: null,
        transactions: null
      },
      toasts: [],
      // Project Store initial state
      projects: [],
      activeProjects: [],
      projectDraft: null,
      draftAutoSaveEnabled: true,
      lastAutoSave: null,
      // Investment Store initial state
      userInvestments: [],
      portfolio: {
        totalInvested: 0,
        totalValue: 0,
        totalGains: 0,
        totalLosses: 0,
        roi: 0
      },
      claimableTokens: [],
      // User Store initial state
      isConnected: false,
      address: null,
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          investment: true,
          project: true
        },
        display: {
          currency: 'USD',
          language: 'en',
          timezone: 'UTC'
        }
      },
      notifications: []
    })
  }

  return { getServerSnapshot }
}

// Stable server snapshot - cached to prevent infinite loops
const stableServerSnapshot = createSSRConfig().getServerSnapshot()

export const getStableServerSnapshot = () => stableServerSnapshot