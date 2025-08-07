'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProgressBar } from '@/components/project'
import { ClaimButton } from '@/components/web3/ClaimButton'
import { WalletConnect } from '@/components/web3/WalletConnect'
import { useInvestmentStore, useUserStore, useProjectStore, investmentSelectors } from '@/lib/store'
import { ProjectStatus } from '@/components/project/types'
// import type { Address } from 'viem'

// Mock user investment data
interface UserInvestment {
  id: string
  projectId: string
  projectName: string
  projectLogo: string
  investmentAmount: number
  investedAt: Date
  status: 'active' | 'completed' | 'failed' | 'claimable'
  expectedReturns: number
  currentValue: number
  refundableAmount?: number
  claimableAmount?: number
  transactionHash: string
}

interface UserProject {
  id: string
  name: string
  logo: string
  status: ProjectStatus
  funding: {
    currentAmount: number
    targetAmount: number
    ownFunding: number
  }
  backers: number
  createdAt: Date
  canApply: boolean // Whether user can apply for something (context-dependent)
}

// Mock data
const mockUserInvestments: UserInvestment[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'DeFiVault Protocol',
    projectLogo: '💰',
    investmentAmount: 5.0,
    investedAt: new Date('2024-02-01'),
    status: 'active',
    expectedReturns: 7.5,
    currentValue: 5.8,
    transactionHash: '0xabc123...'
  },
  {
    id: '2',
    projectId: '2',
    projectName: 'GameFi Universe',
    projectLogo: '🎮',
    investmentAmount: 2.5,
    investedAt: new Date('2024-02-10'),
    status: 'completed',
    expectedReturns: 3.75,
    currentValue: 4.2,
    claimableAmount: 4.2,
    transactionHash: '0xdef456...'
  },
  {
    id: '3',
    projectId: '3',
    projectName: 'Failed Project',
    projectLogo: '❌',
    investmentAmount: 1.0,
    investedAt: new Date('2024-01-15'),
    status: 'failed',
    expectedReturns: 0,
    currentValue: 0,
    refundableAmount: 0.8, // Partial refund available
    transactionHash: '0x789ghi...'
  }
]

const mockUserProjects: UserProject[] = [
  {
    id: '4',
    name: 'My DeFi Project',
    logo: '🚀',
    status: ProjectStatus.ACTIVE,
    funding: {
      currentAmount: 25.5,
      targetAmount: 100,
      ownFunding: 10
    },
    backers: 12,
    createdAt: new Date('2024-01-20'),
    canApply: false
  },
  {
    id: '5',
    name: 'AI Trading Bot',
    logo: '🤖',
    status: ProjectStatus.COMPLETED,
    funding: {
      currentAmount: 150,
      targetAmount: 150,
      ownFunding: 30
    },
    backers: 45,
    createdAt: new Date('2023-12-01'),
    canApply: true // Can apply for some program/feature
  }
]

export default function Dashboard() {
  // Store hooks
  const { isConnected, address } = useUserStore()
  const { investments, portfolioMetrics, claimTokens } = useInvestmentStore()
  const { userCreatedProjects, fetchProjects } = useProjectStore()
  
  // Local state
  const [activeTab, setActiveTab] = useState<'investments' | 'projects'>('investments')
  const [investmentFilter, setInvestmentFilter] = useState<'all' | 'active' | 'completed' | 'claimable'>('all')
  const [projectFilter, setProjectFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all')

  // Calculate summary statistics from store
  const investmentSummary = useMemo(() => {
    const activeInvestments = investmentSelectors.investmentsByStatus('confirmed')(useInvestmentStore.getState()).length
    const completedInvestments = investments.filter(inv => 
      inv.vestingSchedule?.every(v => v.claimed)
    ).length
    
    const refundableAmount = 0 // Mock for now - would be calculated from failed projects
    
    return {
      totalInvested: portfolioMetrics.totalInvested,
      currentValue: portfolioMetrics.totalValue,
      profitLoss: portfolioMetrics.totalGains - portfolioMetrics.totalLosses,
      claimableAmount: portfolioMetrics.claimableAmount,
      refundableAmount,
      activeInvestments,
      completedInvestments
    }
  }, [portfolioMetrics, investments])

  // Filter investments
  const filteredInvestments = useMemo(() => {
    if (investmentFilter === 'all') return investments
    if (investmentFilter === 'claimable') {
      return investmentSelectors.claimableInvestments(useInvestmentStore.getState())
    }
    if (investmentFilter === 'active') {
      return investmentSelectors.investmentsByStatus('confirmed')(useInvestmentStore.getState())
    }
    if (investmentFilter === 'completed') {
      return investments.filter(inv => inv.vestingSchedule?.every(v => v.claimed))
    }
    return investments
  }, [investmentFilter, investments])

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (projectFilter === 'all') return userCreatedProjects
    return userCreatedProjects.filter(project => {
      if (projectFilter === 'draft') return project.status === ProjectStatus.DRAFT
      if (projectFilter === 'active') return project.status === ProjectStatus.ACTIVE
      if (projectFilter === 'completed') return project.status === ProjectStatus.COMPLETED
      return project.status.toString() === projectFilter
    })
  }, [projectFilter, userCreatedProjects])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Handle claim actions
  const handleClaim = async (investmentId: string, amount: number) => {
    try {
      await claimTokens(investmentId)
    } catch (error) {
      console.error('Claim failed:', error)
    }
  }
  
  // Load user data on mount
  useEffect(() => {
    if (isConnected && address) {
      // This would be handled by globalActions.initializeApp() in a real app
      fetchProjects()
    }
  }, [isConnected, address, fetchProjects])

  // Redirect to wallet connection if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dico Platform
              </Link>
              <WalletConnect />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              To access your dashboard and view your investments and projects, please connect your Web3 wallet.
            </p>
            <WalletConnect />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80">
                Dico Platform
              </Link>
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-blue-600">Projects</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {formatAddress(address || '')}
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Track your investments, manage your projects, and explore new opportunities.
          </p>
        </motion.div>

        {/* Portfolio Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Invested</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{investmentSummary.totalInvested.toFixed(2)} ETH</p>
            <p className="text-sm text-gray-500 mt-1">${(investmentSummary.totalInvested * 3500).toLocaleString()} USD</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Value</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{investmentSummary.currentValue.toFixed(2)} ETH</p>
            <p className={`text-sm mt-1 ${investmentSummary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investmentSummary.profitLoss >= 0 ? '+' : ''}{investmentSummary.profitLoss.toFixed(2)} ETH
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Claimable</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(investmentSummary.claimableAmount + investmentSummary.refundableAmount).toFixed(2)} ETH
            </p>
            <p className="text-sm text-purple-600 mt-1">
              {investmentSummary.claimableAmount > 0 && investmentSummary.refundableAmount > 0 ? 'Returns + Refunds' :
               investmentSummary.claimableAmount > 0 ? 'Returns Available' :
               investmentSummary.refundableAmount > 0 ? 'Refunds Available' : 'Nothing to claim'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Projects</h3>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{investmentSummary.activeInvestments}</p>
            <p className="text-sm text-gray-500 mt-1">{investmentSummary.completedInvestments} completed</p>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-200/50">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('investments')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'investments'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>My Investments</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {investments.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'projects'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>My Projects</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {userCreatedProjects.length}
                </span>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <motion.div
              key="investments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Investment Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  {[
                    { key: 'all', label: 'All Investments' },
                    { key: 'active', label: 'Active' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'claimable', label: 'Claimable' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setInvestmentFilter(filter.key as typeof investmentFilter)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        investmentFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Investment
                </Link>
              </div>

              {/* Investments List */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                {filteredInvestments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
                    <p className="text-gray-600 mb-6">
                      {investmentFilter === 'all' 
                        ? "You haven't made any investments yet." 
                        : `No ${investmentFilter} investments found.`}
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Explore Projects
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredInvestments.map((investment, index) => (
                      <motion.div
                        key={investment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 bg-blue-600 rounded opacity-80" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Investment #{investment.id.slice(0, 8)}...
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  investment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  investment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {investment.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>Invested: {investment.amount} ETH</span>
                                <span>•</span>
                                <span>Date: {formatDate(investment.createdAt)}</span>
                                <span>•</span>
                                <span>TX: {formatAddress(investment.transactionHash)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Investment Details */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {investment.tokenAmount.toLocaleString()} Tokens
                              </p>
                              <p className="text-sm text-gray-500">
                                {investment.amount} ETH invested
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              {investment.claimableAmount && investment.claimableAmount > 0 && (
                                <ClaimButton
                                  amount={investment.claimableAmount}
                                  onClaim={() => handleClaim(investment.id, investment.claimableAmount!)}
                                  variant="success"
                                  size="sm"
                                />
                              )}

                              <Link
                                href={`/project/${investment.projectId}`}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                View Project
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Project Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  {[
                    { key: 'all', label: 'All Projects' },
                    { key: 'active', label: 'Active' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'draft', label: 'Draft' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setProjectFilter(filter.key as typeof projectFilter)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        projectFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                
                <Link
                  href="/project/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </Link>
              </div>

              {/* Projects List */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-6">
                      {projectFilter === 'all' 
                        ? "You haven't created any projects yet." 
                        : `No ${projectFilter} projects found.`}
                    </p>
                    <Link
                      href="/project/create"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Project
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              {project.logo ? (
                                <img src={project.logo} alt={`${project.name} logo`} className="w-6 h-6 rounded" />
                              ) : (
                                <div className="w-6 h-6 bg-blue-600 rounded opacity-80" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {project.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                  project.status === ProjectStatus.COMPLETED ? 'bg-blue-100 text-blue-700' :
                                  project.status === ProjectStatus.DRAFT ? 'bg-gray-100 text-gray-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Created on {formatDate(project.createdAt)}
                              </div>
                              <div className="w-full max-w-md">
                                <ProgressBar
                                  currentAmount={project.funding.currentAmount}
                                  targetAmount={project.funding.targetAmount}
                                  creatorStake={project.funding.ownFunding}
                                  backers={project.backers.length}
                                  lastUpdated={project.createdAt.toLocaleDateString()}
                                  height="thin"
                                  variant="default"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Project Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-gray-900">
                                  {project.funding.currentAmount} ETH
                                </p>
                                <p className="text-xs text-gray-500">Raised</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-gray-900">
                                  {Math.round((project.funding.currentAmount / project.funding.targetAmount) * 100)}%
                                </p>
                                <p className="text-xs text-gray-500">Funded</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-gray-900">
                                  {project.backers.length}
                                </p>
                                <p className="text-xs text-gray-500">Backers</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <Link
                                href={`/project/${project.id}`}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                View Details
                              </Link>
                              
                              {project.status === ProjectStatus.DRAFT && (
                                <Link
                                  href={`/project/create?edit=${project.id}`}
                                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Edit
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Ready to Invest More?</h3>
            <p className="text-blue-100 mb-6">
              Discover new innovative projects and diversify your DeFi portfolio.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore Projects
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-3">Have a Great Idea?</h3>
            <p className="text-green-100 mb-6">
              Launch your own project and connect with investors worldwide.
            </p>
            <Link
              href="/project/create"
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Project
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}