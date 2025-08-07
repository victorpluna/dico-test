import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Address } from 'viem'
import type { 
  InvestmentState, 
  InvestmentActions, 
  Investment, 
  InvestmentStatus, 
  PortfolioMetrics, 
  VestingSchedule,
  TransactionState 
} from './types'

const initialPortfolioMetrics: PortfolioMetrics = {
  totalInvested: 0,
  totalValue: 0,
  totalGains: 0,
  totalLosses: 0,
  roi: 0,
  activeInvestments: 0,
  completedInvestments: 0,
  claimableAmount: 0
}

const initialState: InvestmentState = {
  // User investments
  investments: [],
  investmentsById: {},
  
  // Portfolio metrics
  portfolioMetrics: initialPortfolioMetrics,
  
  // Transaction states
  pendingTransactions: {},
  
  // Loading states
  loading: false,
  error: null
}

// Mock API functions (replace with real blockchain calls and API)
const mockApi = {
  fetchUserInvestments: async (address: Address): Promise<Investment[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock investment data
    const mockInvestments: Investment[] = [
      {
        id: 'inv_1',
        projectId: '1',
        investorAddress: address,
        amount: 5.0,
        tokenAmount: 5000,
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        status: InvestmentStatus.CONFIRMED,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        vestingSchedule: [
          {
            releaseDate: new Date('2024-04-15'),
            amount: 1250,
            claimed: true,
            claimedAt: new Date('2024-04-16')
          },
          {
            releaseDate: new Date('2024-07-15'),
            amount: 1250,
            claimed: false
          },
          {
            releaseDate: new Date('2024-10-15'),
            amount: 1250,
            claimed: false
          },
          {
            releaseDate: new Date('2025-01-15'),
            amount: 1250,
            claimed: false
          }
        ],
        claimableAmount: 1250
      },
      {
        id: 'inv_2',
        projectId: '2',
        investorAddress: address,
        amount: 2.5,
        tokenAmount: 2500,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: InvestmentStatus.CONFIRMED,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        vestingSchedule: [
          {
            releaseDate: new Date('2024-05-01'),
            amount: 625,
            claimed: false
          },
          {
            releaseDate: new Date('2024-08-01'),
            amount: 625,
            claimed: false
          },
          {
            releaseDate: new Date('2024-11-01'),
            amount: 625,
            claimed: false
          },
          {
            releaseDate: new Date('2025-02-01'),
            amount: 625,
            claimed: false
          }
        ],
        claimableAmount: 625
      }
    ]
    
    return mockInvestments
  },
  
  fetchInvestmentById: async (id: string): Promise<Investment | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Mock implementation - return null if not found
    return null
  },
  
  claimTokens: async (investmentId: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return '0xclaimtransactionhash' + investmentId
  },
  
  calculateTokenValue: async (tokenAmount: number, tokenSymbol: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Mock token price calculation
    const mockPrices: Record<string, number> = {
      'DIP': 0.002, // 0.002 ETH per token
      'TOKEN': 0.001,
      'PROTO': 0.003
    }
    
    const pricePerToken = mockPrices[tokenSymbol] || 0.001
    return tokenAmount * pricePerToken
  }
}

// Utility functions
const calculatePortfolioMetrics = (investments: Investment[]): PortfolioMetrics => {
  const confirmed = investments.filter(inv => inv.status === InvestmentStatus.CONFIRMED)
  
  const totalInvested = confirmed.reduce((sum, inv) => sum + inv.amount, 0)
  const totalClaimable = confirmed.reduce((sum, inv) => sum + (inv.claimableAmount || 0), 0)
  
  // Mock current value calculation - in real app, fetch current token prices
  const totalValue = totalInvested * 1.2 // Assume 20% portfolio growth
  
  const totalGains = Math.max(0, totalValue - totalInvested)
  const totalLosses = Math.max(0, totalInvested - totalValue)
  const roi = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
  
  const activeInvestments = confirmed.filter(inv => 
    inv.vestingSchedule && inv.vestingSchedule.some(v => !v.claimed)
  ).length
  
  const completedInvestments = confirmed.filter(inv => 
    !inv.vestingSchedule || inv.vestingSchedule.every(v => v.claimed)
  ).length
  
  return {
    totalInvested,
    totalValue,
    totalGains,
    totalLosses,
    roi,
    activeInvestments,
    completedInvestments,
    claimableAmount: totalClaimable
  }
}

const isVestingScheduleClaimable = (schedule: VestingSchedule): boolean => {
  return !schedule.claimed && schedule.releaseDate <= new Date()
}

const calculateClaimableAmount = (investment: Investment): number => {
  if (!investment.vestingSchedule) return 0
  
  return investment.vestingSchedule
    .filter(isVestingScheduleClaimable)
    .reduce((sum, schedule) => sum + schedule.amount, 0)
}

// Create the investment store
export const useInvestmentStore = create<InvestmentState & InvestmentActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        ...initialState,
        
        // Investment operations
        addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
          set((draft) => {
            const newInvestment: Investment = {
              ...investment,
              id: 'inv_' + Date.now(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
            
            draft.investments.push(newInvestment)
            draft.investmentsById[newInvestment.id] = newInvestment
            
            // Recalculate portfolio metrics
            draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
          })
        },
        
        updateInvestment: (id: string, updates: Partial<Investment>) => {
          set((draft) => {
            const investment = draft.investmentsById[id]
            if (investment) {
              Object.assign(investment, { ...updates, updatedAt: new Date() })
              
              // Update in the array as well
              const index = draft.investments.findIndex(inv => inv.id === id)
              if (index !== -1) {
                draft.investments[index] = investment
              }
              
              // Recalculate claimable amount
              if (investment.vestingSchedule) {
                investment.claimableAmount = calculateClaimableAmount(investment)
              }
              
              // Recalculate portfolio metrics
              draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
            }
          })
        },
        
        removeInvestment: (id: string) => {
          set((draft) => {
            delete draft.investmentsById[id]
            draft.investments = draft.investments.filter(inv => inv.id !== id)
            
            // Recalculate portfolio metrics
            draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
          })
        },
        
        // Fetch operations
        fetchUserInvestments: async (address: Address) => {
          set((draft) => {
            draft.loading = true
            draft.error = null
          })
          
          try {
            const investments = await mockApi.fetchUserInvestments(address)
            
            set((draft) => {
              draft.investments = investments
              draft.investmentsById = {}
              
              // Build index
              investments.forEach(investment => {
                draft.investmentsById[investment.id] = investment
              })
              
              // Calculate portfolio metrics
              draft.portfolioMetrics = calculatePortfolioMetrics(investments)
              
              draft.loading = false
              draft.error = null
            })
          } catch (error) {
            set((draft) => {
              draft.loading = false
              draft.error = error instanceof Error ? error.message : 'Failed to fetch investments'
            })
          }
        },
        
        fetchInvestmentById: async (id: string) => {
          const state = get()
          
          // Check cache first
          if (state.investmentsById[id]) {
            return state.investmentsById[id]
          }
          
          try {
            const investment = await mockApi.fetchInvestmentById(id)
            
            if (investment) {
              set((draft) => {
                draft.investmentsById[investment.id] = investment
                
                // Add to array if not exists
                if (!draft.investments.find(inv => inv.id === investment.id)) {
                  draft.investments.push(investment)
                  draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
                }
              })
            }
            
            return investment
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Failed to fetch investment'
            })
            return null
          }
        },
        
        // Claiming operations
        calculateClaimableAmount: (investmentId: string) => {
          const state = get()
          const investment = state.investmentsById[investmentId]
          
          if (!investment) return 0
          
          return calculateClaimableAmount(investment)
        },
        
        claimTokens: async (investmentId: string) => {
          const state = get()
          const investment = state.investmentsById[investmentId]
          
          if (!investment) {
            throw new Error('Investment not found')
          }
          
          // Set transaction state
          const txId = 'claim_' + investmentId
          set((draft) => {
            draft.pendingTransactions[txId] = {
              status: 'pending',
              message: 'Initiating claim transaction...'
            }
          })
          
          try {
            const transactionHash = await mockApi.claimTokens(investmentId)
            
            set((draft) => {
              draft.pendingTransactions[txId] = {
                status: 'confirming',
                message: 'Transaction submitted, waiting for confirmation...',
                transactionHash
              }
            })
            
            // Simulate confirmation delay
            setTimeout(() => {
              set((draft) => {
                const investment = draft.investmentsById[investmentId]
                if (investment && investment.vestingSchedule) {
                  // Mark claimable schedules as claimed
                  investment.vestingSchedule.forEach(schedule => {
                    if (isVestingScheduleClaimable(schedule)) {
                      schedule.claimed = true
                      schedule.claimedAt = new Date()
                    }
                  })
                  
                  // Recalculate claimable amount
                  investment.claimableAmount = calculateClaimableAmount(investment)
                  
                  // Update portfolio metrics
                  draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
                }
                
                draft.pendingTransactions[txId] = {
                  status: 'success',
                  message: 'Tokens claimed successfully!',
                  transactionHash
                }
              })
            }, 3000)
            
          } catch (error) {
            set((draft) => {
              draft.pendingTransactions[txId] = {
                status: 'error',
                message: error instanceof Error ? error.message : 'Claim failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            })
          }
        },
        
        // Portfolio operations
        refreshPortfolioMetrics: () => {
          set((draft) => {
            draft.portfolioMetrics = calculatePortfolioMetrics(draft.investments)
            
            // Update claimable amounts for all investments
            draft.investments.forEach(investment => {
              if (investment.vestingSchedule) {
                investment.claimableAmount = calculateClaimableAmount(investment)
              }
            })
          })
        },
        
        // Transaction management
        setTransactionState: (txId: string, state: TransactionState) => {
          set((draft) => {
            draft.pendingTransactions[txId] = state
          })
        },
        
        clearTransactionState: (txId: string) => {
          set((draft) => {
            delete draft.pendingTransactions[txId]
          })
        },
        
        // Error handling
        setError: (error: string | null) => {
          set((draft) => {
            draft.error = error
          })
        },
        
        clearError: () => {
          set((draft) => {
            draft.error = null
          })
        }
      }))
    ),
    {
      name: 'investment-store'
    }
  )
)

// Selectors for optimized re-renders
export const investmentSelectors = {
  // Get investments by project
  investmentsByProject: (projectId: string) => (state: InvestmentState & InvestmentActions) => {
    return state.investments.filter(inv => inv.projectId === projectId)
  },
  
  // Get claimable investments
  claimableInvestments: (state: InvestmentState & InvestmentActions) => {
    return state.investments.filter(inv => (inv.claimableAmount || 0) > 0)
  },
  
  // Get investments by status
  investmentsByStatus: (status: InvestmentStatus) => (state: InvestmentState & InvestmentActions) => {
    return state.investments.filter(inv => inv.status === status)
  },
  
  // Get total claimable amount
  totalClaimableAmount: (state: InvestmentState & InvestmentActions) => {
    return state.investments.reduce((sum, inv) => sum + (inv.claimableAmount || 0), 0)
  },
  
  // Get portfolio performance
  portfolioPerformance: (state: InvestmentState & InvestmentActions) => {
    const metrics = state.portfolioMetrics
    return {
      ...metrics,
      isPositive: metrics.roi >= 0,
      performanceClass: metrics.roi >= 0 ? 'text-green-600' : 'text-red-600',
      formattedROI: `${metrics.roi >= 0 ? '+' : ''}${metrics.roi.toFixed(2)}%`
    }
  },
  
  // Get investment summary by project
  investmentSummaryByProject: (state: InvestmentState & InvestmentActions) => {
    const summary: Record<string, {
      totalInvested: number
      tokenAmount: number
      claimableAmount: number
      status: InvestmentStatus
    }> = {}
    
    state.investments.forEach(inv => {
      if (!summary[inv.projectId]) {
        summary[inv.projectId] = {
          totalInvested: 0,
          tokenAmount: 0,
          claimableAmount: 0,
          status: inv.status
        }
      }
      
      summary[inv.projectId].totalInvested += inv.amount
      summary[inv.projectId].tokenAmount += inv.tokenAmount
      summary[inv.projectId].claimableAmount += inv.claimableAmount || 0
    })
    
    return summary
  },
  
  // Get pending transactions
  pendingTransactionsArray: (state: InvestmentState & InvestmentActions) => {
    return Object.entries(state.pendingTransactions).map(([txId, txState]) => ({
      txId,
      ...txState
    }))
  }
}

// Export store instance for direct access
export const investmentStore = useInvestmentStore.getState()

// Export types for external use
export type InvestmentStore = ReturnType<typeof useInvestmentStore>