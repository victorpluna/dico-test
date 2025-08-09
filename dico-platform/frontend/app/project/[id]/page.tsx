'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProgressBar, CountdownTimer } from '@/components/project'
import { InvestModal } from '@/components/web3/InvestModal'
import { useWalletConnection } from '@/lib/web3/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Project, ProjectStatus } from '@/components/project/types'
import type { Address } from 'viem'

// Mock project data - in production this would come from an API
const mockProject: Project = {
  id: '1',
  name: 'DeFiVault Protocol',
  description: 'DeFiVault Protocol is a revolutionary decentralized finance platform that enables users to earn yield through automated strategies. Our protocol combines the best of traditional finance with the transparency and security of blockchain technology, offering users unprecedented control over their financial assets.',
  logo: '💰',
  whitepaperUrl: 'https://example.com/whitepaper.pdf',
  projectPlanUrl: 'https://example.com/project-plan.pdf',
  smartContractCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeFiVault
 * @dev A decentralized finance protocol for automated yield generation
 */
contract DeFiVault is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18;
    uint256 public totalDeposits;
    uint256 public totalYield;
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastDepositTime;
    mapping(address => uint256) public accumulatedYield;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event YieldDistributed(uint256 totalAmount);
    
    constructor() ERC20("DeFiVault Token", "DVT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Allows users to deposit ETH and receive DVT tokens
     */
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit must be greater than 0");
        
        balances[msg.sender] += msg.value;
        lastDepositTime[msg.sender] = block.timestamp;
        totalDeposits += msg.value;
        
        // Mint DVT tokens based on deposit amount
        uint256 tokensToMint = msg.value * 100; // 1 ETH = 100 DVT
        _mint(msg.sender, tokensToMint);
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Allows users to withdraw their deposited ETH
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Burn corresponding DVT tokens
        uint256 tokensToBurn = amount * 100;
        _burn(msg.sender, tokensToBurn);
        
        payable(msg.sender).transfer(amount);
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @dev Calculates and distributes yield to depositors
     */
    function distributeYield() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > totalDeposits, "No yield available");
        
        uint256 yieldToDistribute = contractBalance - totalDeposits;
        totalYield += yieldToDistribute;
        
        emit YieldDistributed(yieldToDistribute);
    }
    
    /**
     * @dev Returns the current yield rate
     */
    function getCurrentYieldRate() external view returns (uint256) {
        if (totalDeposits == 0) return 0;
        return (totalYield * 10000) / totalDeposits; // Returns as basis points
    }
    
    /**
     * @dev Emergency function to pause contract operations
     */
    function emergencyPause() external onlyOwner {
        // Implementation would go here
    }
}`,
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
      { id: '1', percentage: 25, title: 'MVP Development', description: 'Core protocol development complete', reached: true, reachedAt: new Date('2024-02-01') },
      { id: '2', percentage: 50, title: 'Beta Testing', description: 'Community testing phase completed', reached: true, reachedAt: new Date('2024-02-15') },
      { id: '3', percentage: 75, title: 'Security Audit', description: 'Professional security audit by leading firm', reached: false },
      { id: '4', percentage: 100, title: 'Mainnet Launch', description: 'Production deployment and public launch', reached: false }
    ]
  },
  creator: {
    id: 'creator1',
    name: 'Alice Johnson',
    email: 'alice@defivault.io',
    walletAddress: '0xabcdef1234567890123456789012345678901234' as Address,
    verified: true,
    reputation: 95,
    avatar: '👩‍💻',
    previousProjects: ['project-alpha', 'defi-bridge']
  },
  status: ProjectStatus.ACTIVE,
  verification: {
    verified: true,
    verifiedAt: new Date('2024-01-10'),
    verificationLevel: 'premium',
    badges: [
      { type: 'whitepaper', verified: true, verifiedAt: new Date('2024-01-10'), details: 'Comprehensive technical whitepaper verified' },
      { type: 'smart_contract', verified: true, verifiedAt: new Date('2024-01-10'), details: 'Smart contract audited by CertiK' },
      { type: 'team', verified: true, verifiedAt: new Date('2024-01-10'), details: 'Team identity and credentials verified' },
      { type: 'legal', verified: true, verifiedAt: new Date('2024-01-12'), details: 'Legal compliance verified' }
    ]
  },
  backers: [
    { id: '1', walletAddress: '0x1111111111111111111111111111111111111111' as Address, investmentAmount: 25.5, investedAt: new Date('2024-02-01'), name: 'CryptoWhale' },
    { id: '2', walletAddress: '0x2222222222222222222222222222222222222222' as Address, investmentAmount: 50, investedAt: new Date('2024-02-05'), anonymous: true },
    { id: '3', walletAddress: '0x3333333333333333333333333333333333333333' as Address, investmentAmount: 50, investedAt: new Date('2024-02-10'), name: 'DeFi_Investor' }
  ],
  updates: [
    {
      id: '1',
      title: 'Beta Testing Results',
      content: 'Our beta testing phase has concluded with excellent results. Over 500 users participated, providing valuable feedback that has been incorporated into the final version.',
      type: 'milestone',
      publishedAt: new Date('2024-02-16'),
      author: 'creator1'
    },
    {
      id: '2',
      title: 'Security Audit Scheduled',
      content: 'We have scheduled our security audit with leading blockchain security firm CertiK. The audit will begin next week and is expected to complete within 2 weeks.',
      type: 'technical',
      publishedAt: new Date('2024-02-20'),
      author: 'creator1'
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-02-20')
}

// Mock transaction history
const mockTransactions = [
  { id: '1', type: 'investment', amount: 25.5, from: '0x1111111111111111111111111111111111111111', timestamp: new Date('2024-02-01'), txHash: '0xabc123...' },
  { id: '2', type: 'investment', amount: 50, from: '0x2222222222222222222222222222222222222222', timestamp: new Date('2024-02-05'), txHash: '0xdef456...' },
  { id: '3', type: 'investment', amount: 50, from: '0x3333333333333333333333333333333333333333', timestamp: new Date('2024-02-10'), txHash: '0x789ghi...' }
]

export default function ProjectDetail() {
  const params = useParams() // eslint-disable-line @typescript-eslint/no-unused-vars
  const { isConnected } = useWalletConnection()
  const [project] = useState<Project>(mockProject)
  const [loading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'updates' | 'backers'>('overview')
  const [investModalOpen, setInvestModalOpen] = useState(false)

  const fundingPercentage = (project.funding.currentAmount / project.funding.targetAmount) * 100 // eslint-disable-line @typescript-eslint/no-unused-vars

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Projects</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{project.name}</span>
      </nav>
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{project.logo}</div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-3xl">{project.name}</CardTitle>
                    {project.verification.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                  
                  {/* Creator Info */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{project.creator.avatar}</span>
                      <div>
                        <p className="text-sm font-medium">{project.creator.name}</p>
                        <p className="text-xs text-muted-foreground">Creator • Reputation: {project.creator.reputation}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setInvestModalOpen(true)}
                  disabled={!isConnected || project.status !== ProjectStatus.ACTIVE}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  size="lg"
                >
                  {!isConnected ? 'Connect Wallet' : 'Invest Now'}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                >
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        {/* Funding Progress */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Funding Progress</CardTitle>
            <ProgressBar
              currentAmount={project.funding.currentAmount}
              targetAmount={project.funding.targetAmount}
              creatorStake={project.funding.ownFunding}
              backers={project.backers.length}
              lastUpdated={project.updatedAt.toLocaleDateString()}
              className="mb-4"
              height="thick"
              variant="purple"
              showTransparency={true}
              showMilestones={true}
              milestones={project.timeline.milestones.map(m => ({
                percentage: m.percentage,
                label: m.title,
                reached: m.reached,
                reachedAt: m.reachedAt
              }))}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{project.funding.currentAmount} ETH</p>
                <p className="text-sm text-gray-500">Raised</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{project.funding.targetAmount} ETH</p>
                <p className="text-sm text-gray-500">Target</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{project.funding.ownFunding} ETH</p>
                <p className="text-sm text-gray-500">Creator Stake</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{project.backers.length}</p>
                <p className="text-sm text-gray-500">Backers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countdown Timer */}
        <Card>
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-4">Time Remaining</CardTitle>
            <CountdownTimer
              endDate={project.timeline.endDate}
              size="large"
              format="block"
              showSeconds={true}
              className="mb-4"
            />
            <p className="text-sm text-muted-foreground text-center">
              Campaign ends on {project.timeline.endDate.toLocaleDateString()}
            </p>
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <span>📋</span>
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <span>🔒</span>
              <span className="hidden sm:inline">Contract</span>
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center space-x-2">
              <span>📢</span>
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            <TabsTrigger value="backers" className="flex items-center space-x-2">
              <span>👥</span>
              <span className="hidden sm:inline">Backers</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token Symbol:</span>
                        <span className="font-medium">{project.tokenomics.tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token Standard:</span>
                        <span className="font-medium">{project.tokenomics.tokenStandard}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Supply:</span>
                        <span className="font-medium">{project.tokenomics.totalSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Investment:</span>
                        <span className="font-medium">{project.funding.minimumInvestment} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Investment:</span>
                        <span className="font-medium">{project.funding.maximumInvestment} ETH</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Documents</h3>
                    <div className="space-y-3">
                      <a href={project.whitepaperUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Whitepaper</p>
                          <p className="text-sm text-gray-500">Technical documentation</p>
                        </div>
                      </a>
                      <a href={project.projectPlanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Project Plan</p>
                          <p className="text-sm text-gray-500">Development roadmap</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tokenomics */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
                    <div className="space-y-3">
                      {project.tokenomics.distribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] }}
                            ></div>
                            <span className="font-medium capitalize">{item.category.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{item.percentage}%</p>
                            <p className="text-sm text-gray-500">{item.amount.toLocaleString()} tokens</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Verification Badges</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {project.verification.badges.map((badge, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${badge.verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className={`w-4 h-4 ${badge.verified ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.verified ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01"} />
                            </svg>
                            <span className={`text-sm font-medium capitalize ${badge.verified ? 'text-green-700' : 'text-gray-500'}`}>
                              {badge.type.replace('_', ' ')}
                            </span>
                          </div>
                          {badge.details && (
                            <p className="text-xs text-gray-600">{badge.details}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Milestones</h3>
                    <div className="space-y-3">
                      {project.timeline.milestones.map((milestone, index) => (
                        <div key={milestone.id} className={`p-4 rounded-lg border ${milestone.reached ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${milestone.reached ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {milestone.reached ? '✓' : index + 1}
                              </div>
                              <span className="font-medium">{milestone.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">{milestone.percentage}%</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">{milestone.description}</p>
                          {milestone.reachedAt && (
                            <p className="text-xs text-green-600 ml-8 mt-1">
                              Completed on {milestone.reachedAt.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card>
              <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Smart Contract Code</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Contract Address:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    {formatAddress(project.smartContractAddress || project.funding.fundingAddress)}
                  </code>
                  <button className="text-primary hover:text-primary/80">
                    View on Etherscan
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm leading-relaxed font-mono">
                  <code>{project.smartContractCode}</code>
                </pre>
                
                {/* Copy button */}
                <button className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-primary">Contract Verified</h4>
                </div>
                <p className="text-primary/80 text-sm">
                  This smart contract has been audited and verified by our security team. 
                  The code above represents the exact contract that will be deployed.
                </p>
              </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6">Project Updates</h3>
              
              {project.updates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h6a2 2 0 012 2v2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h4>
                  <p className="text-gray-500">Check back later for project updates and announcements.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {project.updates.map((update, index) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            update.type === 'milestone' ? 'bg-green-100 text-green-600' :
                            update.type === 'technical' ? 'bg-primary/10 text-primary' :
                            update.type === 'funding' ? 'bg-primary/10 text-primary' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {update.type === 'milestone' ? '🎯' :
                             update.type === 'technical' ? '🔧' :
                             update.type === 'funding' ? '💰' : '📢'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{update.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{update.type} Update</p>
                          </div>
                        </div>
                        <time className="text-sm text-gray-500">
                          {formatDate(update.publishedAt)}
                        </time>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{update.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backers">
            <Card>
              <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Project Backers</h3>
                <span className="text-sm text-gray-500">{project.backers.length} total backers</span>
              </div>
              
              {/* Transaction History */}
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
                <div className="space-y-3">
                  {mockTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.amount} ETH Investment</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>From: {formatAddress(tx.from)}</span>
                            <span>•</span>
                            <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              {formatAddress(tx.txHash)}
                            </a>
                          </div>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500">
                        {formatDate(tx.timestamp)}
                      </time>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Backers List */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Top Backers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.backers.map((backer, index) => (
                    <motion.div
                      key={backer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {backer.anonymous ? '?' : (backer.name ? backer.name[0].toUpperCase() : formatAddress(backer.walletAddress)[2].toUpperCase())}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {backer.anonymous ? 'Anonymous' : (backer.name || formatAddress(backer.walletAddress))}
                          </p>
                          <p className="text-sm text-gray-500">
                            Invested on {backer.investedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{backer.investmentAmount} ETH</p>
                        <p className="text-sm text-gray-500">
                          {((backer.investmentAmount / project.funding.currentAmount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Investment Modal */}
      <InvestModal
        isOpen={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        projectAddress={project.smartContractAddress || project.funding.fundingAddress}
        projectName={project.name}
        tokenSymbol={project.tokenomics.tokenSymbol}
        tokenPrice={0.001}
        vestingPeriod="12 months"
      />
    </div>
  )
}