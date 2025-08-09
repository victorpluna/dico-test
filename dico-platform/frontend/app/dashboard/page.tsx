'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProgressBar } from '@/components/project'
import { ClaimButton } from '@/components/web3/ClaimButton'
import { WalletConnect } from '@/components/web3/WalletConnect'
import { useInvestmentStore, useUserStore, useProjectStore, investmentSelectors } from '@/lib/store'
import { ProjectStatus } from '@/components/project/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-8 pb-6">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-xl text-muted-foreground mb-8">
                To access your dashboard and view your investments and projects, please connect your Web3 wallet.
              </p>
              <WalletConnect />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* User Address Display */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Track your investments, manage your projects, and explore new opportunities.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {formatAddress(address || '')}
          </Badge>
          <WalletConnect />
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Invested</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">{investmentSummary.totalInvested.toFixed(2)} ETH</p>
            <p className="text-sm text-muted-foreground mt-1">${(investmentSummary.totalInvested * 3500).toLocaleString()} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Current Value</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">{investmentSummary.currentValue.toFixed(2)} ETH</p>
            <p className={`text-sm mt-1 ${investmentSummary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investmentSummary.profitLoss >= 0 ? '+' : ''}{investmentSummary.profitLoss.toFixed(2)} ETH
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Claimable</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {(investmentSummary.claimableAmount + investmentSummary.refundableAmount).toFixed(2)} ETH
            </p>
            <p className="text-sm text-purple-600 mt-1">
              {investmentSummary.claimableAmount > 0 && investmentSummary.refundableAmount > 0 ? 'Returns + Refunds' :
               investmentSummary.claimableAmount > 0 ? 'Returns Available' :
               investmentSummary.refundableAmount > 0 ? 'Refunds Available' : 'Nothing to claim'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">{investmentSummary.activeInvestments}</p>
            <p className="text-sm text-muted-foreground mt-1">{investmentSummary.completedInvestments} completed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'investments' | 'projects')}>
          <TabsList>
            <TabsTrigger value="investments" className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>My Investments</span>
              <Badge variant="secondary" className="text-xs">
                {investments.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>My Projects</span>
              <Badge variant="secondary" className="text-xs">
                {userCreatedProjects.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Investment Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Filter:</span>
                  {[
                    { key: 'all', label: 'All Investments' },
                    { key: 'active', label: 'Active' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'claimable', label: 'Claimable' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={investmentFilter === filter.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInvestmentFilter(filter.key as typeof investmentFilter)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                
                <Button asChild>
                  <Link href="/">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Investment
                  </Link>
                </Button>
              </div>

              {/* Investments List */}
              <Card>
                <CardContent className="p-0">
                  {filteredInvestments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">No investments found</h3>
                      <p className="text-muted-foreground mb-6">
                        {investmentFilter === 'all' 
                          ? "You haven't made any investments yet." 
                          : `No ${investmentFilter} investments found.`}
                      </p>
                      <Button asChild>
                        <Link href="/">
                          Explore Projects
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
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
                                  <h3 className="text-lg font-semibold">
                                    Investment #{investment.id.slice(0, 8)}...
                                  </h3>
                                  <Badge variant={investment.status === 'confirmed' ? 'default' : investment.status === 'pending' ? 'secondary' : 'destructive'}>
                                    {investment.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
                                <p className="text-lg font-bold">
                                  {investment.tokenAmount.toLocaleString()} Tokens
                                </p>
                                <p className="text-sm text-muted-foreground">
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

                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/project/${investment.projectId}`}>
                                    View Project
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="projects">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Project Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Filter:</span>
                  {[
                    { key: 'all', label: 'All Projects' },
                    { key: 'active', label: 'Active' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'draft', label: 'Draft' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={projectFilter === filter.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProjectFilter(filter.key as typeof projectFilter)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                
                <Button asChild>
                  <Link href="/project/create">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Project
                  </Link>
                </Button>
              </div>

              {/* Projects List */}
              <Card>
                <CardContent className="p-0">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">No projects found</h3>
                      <p className="text-muted-foreground mb-6">
                        {projectFilter === 'all' 
                          ? "You haven't created any projects yet." 
                          : `No ${projectFilter} projects found.`}
                      </p>
                      <Button asChild>
                        <Link href="/project/create">
                          Create Your First Project
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
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
                                  <h3 className="text-lg font-semibold">
                                    {project.name}
                                  </h3>
                                  <Badge variant={
                                    project.status === ProjectStatus.ACTIVE ? 'default' :
                                    project.status === ProjectStatus.COMPLETED ? 'secondary' :
                                    project.status === ProjectStatus.DRAFT ? 'outline' :
                                    'secondary'
                                  }>
                                    {project.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
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
                                  <p className="text-lg font-bold">
                                    {project.funding.currentAmount} ETH
                                  </p>
                                  <p className="text-xs text-muted-foreground">Raised</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    {Math.round((project.funding.currentAmount / project.funding.targetAmount) * 100)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Funded</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    {project.backers.length}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Backers</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/project/${project.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                                
                                {project.status === ProjectStatus.DRAFT && (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/project/create?edit=${project.id}`}>
                                      Edit
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-3">Ready to Invest More?</h3>
            <p className="text-primary-foreground/80 mb-6">
              Discover new innovative projects and diversify your DeFi portfolio.
            </p>
            <Button asChild variant="secondary">
              <Link href="/">
                Explore Projects
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground border-0">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-3">Have a Great Idea?</h3>
            <p className="text-primary-foreground/80 mb-6">
              Launch your own project and connect with investors worldwide.
            </p>
            <Button asChild variant="secondary">
              <Link href="/project/create">
                Create Project
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}