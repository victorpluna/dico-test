import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Project, ProjectStatus, ProjectFormData } from '@/components/project/types'
import type { 
  ProjectState, 
  ProjectActions, 
  ProjectFetchParams,
  ProjectFilters,
  ProjectSortOptions,
  PaginationOptions 
} from './types'

// Default values
const defaultFilters: ProjectFilters = {
  status: [ProjectStatus.ACTIVE],
  verified: undefined,
  minFunding: undefined,
  maxFunding: undefined,
  category: undefined,
  creator: undefined,
  search: undefined
}

const defaultSortOptions: ProjectSortOptions = {
  field: 'createdAt',
  direction: 'desc'
}

const defaultPagination: PaginationOptions = {
  page: 1,
  limit: 12
}

const initialState: ProjectState = {
  // Project lists
  projects: [],
  featuredProjects: [],
  userCreatedProjects: [],
  
  // Project details cache
  projectsById: {},
  
  // Search and filter state
  searchQuery: '',
  filters: defaultFilters,
  sortOptions: defaultSortOptions,
  pagination: defaultPagination,
  
  // Loading and error states
  loading: false,
  error: null,
  
  // Draft management
  projectDraft: null,
  draftAutoSaveEnabled: true,
  lastAutoSave: null
}

// Mock API functions (replace with real API calls)
const mockApi = {
  fetchProjects: async (params: ProjectFetchParams = {}): Promise<{ projects: Project[], total: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock data - replace with real API call
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'DeFi Innovation Protocol',
        description: 'Revolutionary DeFi protocol for cross-chain liquidity',
        logo: '/api/placeholder/64/64',
        whitepaperUrl: 'ipfs://QmExample1',
        projectPlanUrl: 'ipfs://QmExample2',
        smartContractCode: 'pragma solidity ^0.8.0;\n\ncontract DefiProtocol { ... }',
        smartContractAddress: '0x1234567890123456789012345678901234567890',
        tokenomics: {
          totalSupply: 1000000,
          distribution: [
            { category: 'public_sale', percentage: 40, amount: 400000 },
            { category: 'team', percentage: 20, amount: 200000 },
            { category: 'development', percentage: 25, amount: 250000 },
            { category: 'marketing', percentage: 10, amount: 100000 },
            { category: 'reserve', percentage: 5, amount: 50000 }
          ],
          tokenStandard: 'ERC-20',
          tokenSymbol: 'DIP',
          tokenName: 'DeFi Innovation Protocol Token'
        },
        funding: {
          currentAmount: 45.5,
          targetAmount: 100,
          ownFunding: 15,
          fundingAddress: '0x1234567890123456789012345678901234567890'
        },
        timeline: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          milestones: [
            { id: '1', percentage: 25, title: 'MVP Development', description: 'Core functionality', reached: true, reachedAt: new Date('2024-03-15') },
            { id: '2', percentage: 50, title: 'Beta Launch', description: 'Public beta testing', reached: false },
            { id: '3', percentage: 75, title: 'Audit Complete', description: 'Security audit', reached: false },
            { id: '4', percentage: 100, title: 'Mainnet Launch', description: 'Full release', reached: false }
          ]
        },
        creator: {
          id: 'creator1',
          name: 'John Doe',
          email: 'john@example.com',
          walletAddress: '0x1234567890123456789012345678901234567890',
          verified: true,
          reputation: 95
        },
        status: ProjectStatus.ACTIVE,
        verification: {
          verified: true,
          verifiedAt: new Date('2024-01-15'),
          verificationLevel: 'premium',
          badges: [
            { type: 'whitepaper', verified: true, verifiedAt: new Date('2024-01-10') },
            { type: 'smart_contract', verified: true, verifiedAt: new Date('2024-01-12') },
            { type: 'team', verified: true, verifiedAt: new Date('2024-01-15') }
          ]
        },
        backers: [
          { id: 'backer1', walletAddress: '0x9876543210987654321098765432109876543210', investmentAmount: 5, investedAt: new Date('2024-02-01') }
        ],
        updates: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-02-15')
      }
    ]
    
    // Apply filters, sorting, pagination in real implementation
    return { projects: mockProjects, total: mockProjects.length }
  },
  
  fetchProjectById: async (id: string): Promise<Project | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Mock implementation - return null if not found
    return null
  },
  
  createProject: async (data: ProjectFormData): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return 'project_' + Date.now()
  },
  
  updateProject: async (id: string, data: Partial<Project>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800))
  },
  
  deleteProject: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600))
  }
}

// Utility functions
const applyFiltersAndSort = (
  projects: Project[],
  filters: ProjectFilters,
  sortOptions: ProjectSortOptions,
  searchQuery: string
): Project[] => {
  let filtered = [...projects]
  
  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.creator.name.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(project => filters.status!.includes(project.status))
  }
  
  // Apply verified filter
  if (filters.verified !== undefined) {
    filtered = filtered.filter(project => project.verification.verified === filters.verified)
  }
  
  // Apply funding range filters
  if (filters.minFunding !== undefined) {
    filtered = filtered.filter(project => project.funding.currentAmount >= filters.minFunding!)
  }
  
  if (filters.maxFunding !== undefined) {
    filtered = filtered.filter(project => project.funding.currentAmount <= filters.maxFunding!)
  }
  
  // Apply creator filter
  if (filters.creator) {
    filtered = filtered.filter(project => project.creator.id === filters.creator)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sortOptions.field) {
      case 'createdAt':
        aValue = a.createdAt.getTime()
        bValue = b.createdAt.getTime()
        break
      case 'fundingRatio':
        aValue = a.funding.currentAmount / a.funding.targetAmount
        bValue = b.funding.currentAmount / b.funding.targetAmount
        break
      case 'timeRemaining':
        aValue = a.timeline.endDate.getTime() - Date.now()
        bValue = b.timeline.endDate.getTime() - Date.now()
        break
      case 'popularity':
        aValue = a.backers.length
        bValue = b.backers.length
        break
      default:
        aValue = a.createdAt.getTime()
        bValue = b.createdAt.getTime()
    }
    
    if (sortOptions.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
  
  return filtered
}

// Create the project store
export const useProjectStore = create<ProjectState & ProjectActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        ...initialState,
        
        // Project CRUD operations
        fetchProjects: async (params: ProjectFetchParams = {}) => {
          const state = get()
          
          set((draft) => {
            draft.loading = true
            draft.error = null
          })
          
          try {
            const fetchParams = {
              page: params.page || state.pagination.page,
              limit: params.limit || state.pagination.limit,
              filters: { ...state.filters, ...params.filters },
              sort: params.sort || state.sortOptions,
              featured: params.featured || false
            }
            
            const result = await mockApi.fetchProjects(fetchParams)
            
            set((draft) => {
              if (params.featured) {
                draft.featuredProjects = result.projects
              } else {
                if (fetchParams.page === 1) {
                  draft.projects = result.projects
                } else {
                  // Append to existing projects for pagination
                  draft.projects.push(...result.projects)
                }
              }
              
              // Update cache
              result.projects.forEach(project => {
                draft.projectsById[project.id] = project
              })
              
              draft.loading = false
              draft.error = null
            })
          } catch (error) {
            set((draft) => {
              draft.loading = false
              draft.error = error instanceof Error ? error.message : 'Failed to fetch projects'
            })
          }
        },
        
        fetchProjectById: async (id: string) => {
          const state = get()
          
          // Check cache first
          if (state.projectsById[id]) {
            return state.projectsById[id]
          }
          
          try {
            const project = await mockApi.fetchProjectById(id)
            
            if (project) {
              set((draft) => {
                draft.projectsById[project.id] = project
              })
            }
            
            return project
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Failed to fetch project'
            })
            return null
          }
        },
        
        createProject: async (data: ProjectFormData) => {
          set((draft) => {
            draft.loading = true
            draft.error = null
          })
          
          try {
            const projectId = await mockApi.createProject(data)
            
            set((draft) => {
              draft.loading = false
              draft.projectDraft = null // Clear draft after successful creation
              draft.lastAutoSave = null
            })
            
            return projectId
          } catch (error) {
            set((draft) => {
              draft.loading = false
              draft.error = error instanceof Error ? error.message : 'Failed to create project'
            })
            return null
          }
        },
        
        updateProject: async (id: string, data: Partial<Project>) => {
          try {
            await mockApi.updateProject(id, data)
            
            set((draft) => {
              if (draft.projectsById[id]) {
                Object.assign(draft.projectsById[id], data)
              }
              
              // Update in lists as well
              const updateInList = (list: Project[]) => {
                const index = list.findIndex(p => p.id === id)
                if (index !== -1) {
                  Object.assign(list[index], data)
                }
              }
              
              updateInList(draft.projects)
              updateInList(draft.featuredProjects)
              updateInList(draft.userCreatedProjects)
            })
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Failed to update project'
            })
          }
        },
        
        deleteProject: async (id: string) => {
          try {
            await mockApi.deleteProject(id)
            
            set((draft) => {
              delete draft.projectsById[id]
              draft.projects = draft.projects.filter(p => p.id !== id)
              draft.featuredProjects = draft.featuredProjects.filter(p => p.id !== id)
              draft.userCreatedProjects = draft.userCreatedProjects.filter(p => p.id !== id)
            })
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Failed to delete project'
            })
          }
        },
        
        // Search and filtering
        setSearchQuery: (query: string) => {
          set((draft) => {
            draft.searchQuery = query
            draft.pagination.page = 1 // Reset to first page when searching
          })
        },
        
        setFilters: (filters: Partial<ProjectFilters>) => {
          set((draft) => {
            draft.filters = { ...draft.filters, ...filters }
            draft.pagination.page = 1 // Reset to first page when filtering
          })
        },
        
        setSortOptions: (sort: ProjectSortOptions) => {
          set((draft) => {
            draft.sortOptions = sort
            draft.pagination.page = 1 // Reset to first page when sorting
          })
        },
        
        setPagination: (pagination: Partial<PaginationOptions>) => {
          set((draft) => {
            draft.pagination = { ...draft.pagination, ...pagination }
          })
        },
        
        clearFilters: () => {
          set((draft) => {
            draft.filters = defaultFilters
            draft.searchQuery = ''
            draft.sortOptions = defaultSortOptions
            draft.pagination = defaultPagination
          })
        },
        
        // Draft management
        saveDraft: (data: Partial<ProjectFormData>) => {
          set((draft) => {
            draft.projectDraft = { ...draft.projectDraft, ...data }
            draft.lastAutoSave = new Date()
          })
        },
        
        loadDraft: () => {
          return get().projectDraft
        },
        
        clearDraft: () => {
          set((draft) => {
            draft.projectDraft = null
            draft.lastAutoSave = null
          })
        },
        
        enableAutoSave: () => {
          set((draft) => {
            draft.draftAutoSaveEnabled = true
          })
        },
        
        disableAutoSave: () => {
          set((draft) => {
            draft.draftAutoSaveEnabled = false
          })
        },
        
        // Cache management
        invalidateCache: (projectId?: string) => {
          set((draft) => {
            if (projectId) {
              delete draft.projectsById[projectId]
            } else {
              draft.projectsById = {}
              draft.projects = []
              draft.featuredProjects = []
              draft.userCreatedProjects = []
            }
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
      name: 'project-store'
    }
  )
)

// Selectors for optimized re-renders
export const projectSelectors = {
  // Get filtered and sorted projects
  filteredProjects: (state: ProjectState & ProjectActions) => {
    return applyFiltersAndSort(
      state.projects,
      state.filters,
      state.sortOptions,
      state.searchQuery
    )
  },
  
  // Get project by ID from cache
  projectById: (id: string) => (state: ProjectState & ProjectActions) => {
    return state.projectsById[id] || null
  },
  
  // Get projects by creator address
  projectsByCreator: (creatorId: string) => (state: ProjectState & ProjectActions) => {
    return state.projects.filter(project => project.creator.id === creatorId)
  },
  
  // Get project count
  projectCount: (state: ProjectState & ProjectActions) => {
    return applyFiltersAndSort(
      state.projects,
      state.filters,
      state.sortOptions,
      state.searchQuery
    ).length
  },
  
  // Check if has more projects for pagination
  hasMoreProjects: (state: ProjectState & ProjectActions) => {
    const currentPage = state.pagination.page
    const limit = state.pagination.limit
    const totalProjects = state.projects.length
    
    return currentPage * limit < totalProjects
  },
  
  // Get draft status
  hasDraft: (state: ProjectState & ProjectActions) => {
    return state.projectDraft !== null && Object.keys(state.projectDraft).length > 0
  },
  
  // Get auto-save status
  autoSaveStatus: (state: ProjectState & ProjectActions) => {
    if (!state.draftAutoSaveEnabled) return 'disabled'
    if (!state.lastAutoSave) return 'no-changes'
    
    const timeSinceLastSave = Date.now() - state.lastAutoSave.getTime()
    if (timeSinceLastSave < 5000) return 'saved'
    
    return 'pending'
  }
}

// Export store instance for direct access
export const projectStore = useProjectStore.getState()

// Export types for external use
export type ProjectStore = ReturnType<typeof useProjectStore>