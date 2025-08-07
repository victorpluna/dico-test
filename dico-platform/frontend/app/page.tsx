'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectCard } from '@/components/project'
import { InvestModal } from '@/components/web3/InvestModal'
import { WalletConnect } from '@/components/web3/WalletConnect'
import { useWalletConnection } from '@/lib/web3/hooks'
import { Project, ProjectStatus, ProjectFilters, ProjectSortOptions } from '@/components/project/types'
import type { Address } from 'viem'

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'DeFiVault Protocol',
    description: 'A revolutionary decentralized finance protocol that enables users to earn yield through automated strategies.',
    logo: '💰',
    whitepaperUrl: 'https://example.com/whitepaper.pdf',
    projectPlanUrl: 'https://example.com/project-plan.pdf',
    smartContractCode: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract DeFiVault {\n    mapping(address => uint256) public balances;\n    \n    function deposit() external payable {\n        balances[msg.sender] += msg.value;\n    }\n}`,
    smartContractAddress: '0x1234567890123456789012345678901234567890' as Address,
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
      tokenSymbol: 'DVT',
      tokenName: 'DeFiVault Token'
    },
    funding: {
      currentAmount: 125.5,
      targetAmount: 500,
      ownFunding: 50,
      fundingAddress: '0x1234567890123456789012345678901234567890' as Address,
      minimumInvestment: 0.1,
      maximumInvestment: 10
    },
    timeline: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      milestones: [
        { id: '1', percentage: 25, title: 'MVP Development', description: 'Core protocol development', reached: true, reachedAt: new Date('2024-02-01') },
        { id: '2', percentage: 50, title: 'Beta Testing', description: 'Community testing phase', reached: true, reachedAt: new Date('2024-02-15') },
        { id: '3', percentage: 75, title: 'Security Audit', description: 'Professional security audit', reached: false },
        { id: '4', percentage: 100, title: 'Mainnet Launch', description: 'Production deployment', reached: false }
      ]
    },
    creator: {
      id: 'creator1',
      name: 'Alice Johnson',
      email: 'alice@defivault.io',
      walletAddress: '0xabcdef1234567890123456789012345678901234' as Address,
      verified: true,
      reputation: 95
    },
    status: ProjectStatus.ACTIVE,
    verification: {
      verified: true,
      verifiedAt: new Date('2024-01-10'),
      verificationLevel: 'premium',
      badges: [
        { type: 'whitepaper', verified: true, verifiedAt: new Date('2024-01-10') },
        { type: 'smart_contract', verified: true, verifiedAt: new Date('2024-01-10') },
        { type: 'team', verified: true, verifiedAt: new Date('2024-01-10') }
      ]
    },
    backers: [
      { id: '1', walletAddress: '0x1111111111111111111111111111111111111111' as Address, investmentAmount: 25.5, investedAt: new Date('2024-02-01') },
      { id: '2', walletAddress: '0x2222222222222222222222222222222222222222' as Address, investmentAmount: 50, investedAt: new Date('2024-02-05') },
      { id: '3', walletAddress: '0x3333333333333333333333333333333333333333' as Address, investmentAmount: 50, investedAt: new Date('2024-02-10') }
    ],
    updates: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '2',
    name: 'GameFi Universe',
    description: 'A metaverse gaming platform with play-to-earn mechanics and NFT integration.',
    logo: '🎮',
    whitepaperUrl: 'https://example.com/gamefi-whitepaper.pdf',
    projectPlanUrl: 'https://example.com/gamefi-plan.pdf',
    smartContractCode: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract GameFiToken {\n    string public name = "GameFi Token";\n    string public symbol = "GFT";\n}`,
    tokenomics: {
      totalSupply: 10000000,
      distribution: [
        { category: 'public_sale', percentage: 30, amount: 3000000 },
        { category: 'team', percentage: 15, amount: 1500000 },
        { category: 'development', percentage: 30, amount: 3000000 },
        { category: 'marketing', percentage: 15, amount: 1500000 },
        { category: 'reserve', percentage: 10, amount: 1000000 }
      ],
      tokenStandard: 'ERC-20',
      tokenSymbol: 'GFT',
      tokenName: 'GameFi Token'
    },
    funding: {
      currentAmount: 75.2,
      targetAmount: 300,
      ownFunding: 25,
      fundingAddress: '0x5678901234567890123456789012345678901234' as Address,
      minimumInvestment: 0.05,
      maximumInvestment: 5
    },
    timeline: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-01'),
      milestones: [
        { id: '1', percentage: 25, title: 'Game Alpha', description: 'Initial playable version', reached: true, reachedAt: new Date('2024-02-20') },
        { id: '2', percentage: 50, title: 'NFT Integration', description: 'NFT marketplace integration', reached: false },
        { id: '3', percentage: 75, title: 'Token Economy', description: 'Play-to-earn implementation', reached: false },
        { id: '4', percentage: 100, title: 'Public Launch', description: 'Full game release', reached: false }
      ]
    },
    creator: {
      id: 'creator2',
      name: 'Bob Smith',
      email: 'bob@gamefi.io',
      walletAddress: '0xdef1234567890123456789012345678901234567' as Address,
      verified: true,
      reputation: 88
    },
    status: ProjectStatus.ACTIVE,
    verification: {
      verified: true,
      verificationLevel: 'standard',
      badges: [
        { type: 'whitepaper', verified: true },
        { type: 'team', verified: true }
      ]
    },
    backers: [
      { id: '1', walletAddress: '0x4444444444444444444444444444444444444444' as Address, investmentAmount: 30, investedAt: new Date('2024-02-10') },
      { id: '2', walletAddress: '0x5555555555555555555555555555555555555555' as Address, investmentAmount: 45.2, investedAt: new Date('2024-02-15') }
    ],
    updates: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'GreenChain Carbon',
    description: 'Blockchain-based carbon credit trading platform for sustainable businesses.',
    logo: '🌱',
    whitepaperUrl: 'https://example.com/greenchain-whitepaper.pdf',
    projectPlanUrl: 'https://example.com/greenchain-plan.pdf',
    smartContractCode: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract CarbonCredit {\n    mapping(address => uint256) public credits;\n    \n    function mint(address to, uint256 amount) external {\n        credits[to] += amount;\n    }\n}`,
    tokenomics: {
      totalSupply: 5000000,
      distribution: [
        { category: 'public_sale', percentage: 35, amount: 1750000 },
        { category: 'team', percentage: 20, amount: 1000000 },
        { category: 'development', percentage: 25, amount: 1250000 },
        { category: 'marketing', percentage: 15, amount: 750000 },
        { category: 'reserve', percentage: 5, amount: 250000 }
      ],
      tokenStandard: 'ERC-20',
      tokenSymbol: 'GCC',
      tokenName: 'GreenChain Carbon'
    },
    funding: {
      currentAmount: 45.8,
      targetAmount: 200,
      ownFunding: 20,
      fundingAddress: '0x9012345678901234567890123456789012345678' as Address,
      minimumInvestment: 0.1,
      maximumInvestment: 8
    },
    timeline: {
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-03-20'),
      milestones: [
        { id: '1', percentage: 25, title: 'Platform Beta', description: 'Initial trading platform', reached: true, reachedAt: new Date('2024-02-05') },
        { id: '2', percentage: 50, title: 'Corporate Partnerships', description: 'B2B integrations', reached: false },
        { id: '3', percentage: 75, title: 'Verification System', description: 'Carbon credit verification', reached: false },
        { id: '4', percentage: 100, title: 'Global Launch', description: 'Worldwide availability', reached: false }
      ]
    },
    creator: {
      id: 'creator3',
      name: 'Carol Green',
      email: 'carol@greenchain.io',
      walletAddress: '0x3456789012345678901234567890123456789012' as Address,
      verified: true,
      reputation: 92
    },
    status: ProjectStatus.ACTIVE,
    verification: {
      verified: true,
      verificationLevel: 'premium',
      badges: [
        { type: 'whitepaper', verified: true },
        { type: 'smart_contract', verified: true },
        { type: 'team', verified: true },
        { type: 'legal', verified: true }
      ]
    },
    backers: [
      { id: '1', walletAddress: '0x6666666666666666666666666666666666666666' as Address, investmentAmount: 20, investedAt: new Date('2024-02-01') },
      { id: '2', walletAddress: '0x7777777777777777777777777777777777777777' as Address, investmentAmount: 25.8, investedAt: new Date('2024-02-12') }
    ],
    updates: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-12')
  }
]

export default function ProjectsGrid() {
  const { isConnected } = useWalletConnection()
  const [projects] = useState<Project[]>(mockProjects)
  const [loading] = useState(false)
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [ProjectStatus.ACTIVE],
    verified: true
  })
  const [sortBy, setSortBy] = useState<ProjectSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  })
  
  // Investment modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [investModalOpen, setInvestModalOpen] = useState(false)

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let result = projects

    // Apply search filter
    if (searchTerm) {
      result = result.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(project => filters.status!.includes(project.status))
    }

    // Apply verification filter
    if (filters.verified !== undefined) {
      result = result.filter(project => project.verification.verified === filters.verified)
    }

    // Apply funding range filters
    if (filters.minFunding !== undefined) {
      result = result.filter(project => project.funding.currentAmount >= filters.minFunding!)
    }
    if (filters.maxFunding !== undefined) {
      result = result.filter(project => project.funding.currentAmount <= filters.maxFunding!)
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number, bValue: string | number

      switch (sortBy.field) {
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'fundingRatio':
          aValue = a.funding.currentAmount / a.funding.targetAmount
          bValue = b.funding.currentAmount / b.funding.targetAmount
          break
        case 'timeRemaining':
          aValue = a.timeline.endDate.getTime()
          bValue = b.timeline.endDate.getTime()
          break
        case 'popularity':
          aValue = a.backers.length
          bValue = b.backers.length
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (sortBy.direction === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return result
  }, [projects, searchTerm, filters, sortBy])

  // Calculate time remaining for each project
  const getTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const difference = endDate.getTime() - now.getTime()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }

  const handleInvestClick = (project: Project) => {
    setSelectedProject(project)
    setInvestModalOpen(true)
  }

  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dico Platform
              </h1>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {filteredProjects.length} Active Projects
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-6"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Discover Innovative <span className="text-blue-600">DeFi Projects</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Invest in verified, transparent projects with full access to smart contracts,
              documentation, and creator commitment through locked funds.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects, creators, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
              />
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Verification Filter */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified === true}
                  onChange={(e) => handleFilterChange({ verified: e.target.checked ? true : undefined })}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Verified Only</span>
              </label>

              {/* Funding Range */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Min Funding:</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="10"
                  value={filters.minFunding || ''}
                  onChange={(e) => handleFilterChange({ minFunding: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-500">ETH</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [typeof sortBy.field, typeof sortBy.direction]
                  setSortBy({ field, direction })
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="fundingRatio-desc">Most Funded</option>
                <option value="fundingRatio-asc">Least Funded</option>
                <option value="timeRemaining-asc">Ending Soon</option>
                <option value="popularity-desc">Most Popular</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find more projects.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ status: [ProjectStatus.ACTIVE], verified: true })
              }}
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project, index) => {
              const timeRemaining = getTimeRemaining(project.timeline.endDate)
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <ProjectCard
                    projectName={project.name}
                    logo={project.logo}
                    currentFunding={project.funding.currentAmount}
                    targetFunding={project.funding.targetAmount}
                    timeRemaining={timeRemaining}
                    ownFunding={project.funding.ownFunding}
                    backers={project.backers.length}
                    verified={project.verification.verified}
                    lastUpdated={project.updatedAt.toLocaleDateString()}
                    cardIndex={index}
                    onCardClick={() => window.open(`/project/${project.id}`, '_self')}
                    className="h-full transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:-translate-y-2"
                  />
                  
                  {/* Invest Button Overlay - appears on hover */}
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
                    >
                      <div className="absolute bottom-4 left-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInvestClick(project)
                          }}
                          disabled={!isConnected}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isConnected ? 'Invest Now' : 'Connect Wallet to Invest'}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Have an Innovative Project?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join our platform and get access to a community of investors looking for transparent,
            verified projects with real potential.
          </p>
          <button
            onClick={() => window.open('/project/create', '_self')}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create Project
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Investment Modal */}
      {selectedProject && (
        <InvestModal
          isOpen={investModalOpen}
          onClose={() => {
            setInvestModalOpen(false)
            setSelectedProject(null)
          }}
          projectAddress={selectedProject.smartContractAddress || selectedProject.funding.fundingAddress}
          projectName={selectedProject.name}
          tokenSymbol={selectedProject.tokenomics.tokenSymbol}
          tokenPrice={0.001} // Mock token price
          vestingPeriod="12 months"
        />
      )}
    </div>
  )
}