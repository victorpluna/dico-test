'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useProjectStore, globalActions } from '@/lib/store'
import { useWalletConnection, useWalletBalance } from '@/lib/web3/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface InvestModalProps {
  projectId: string
  projectAddress: string
}

export function InvestModal() {
  const { investModal, hideInvestModal } = useUIStore()
  const { projectsById } = useProjectStore()
  const { isConnected, address } = useWalletConnection()
  const { formattedBalance } = useWalletBalance(address)
  
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const project = investModal.projectId ? projectsById[investModal.projectId] : null
  const isValidAmount = parseFloat(investmentAmount) > 0 && parseFloat(investmentAmount) <= parseFloat(formattedBalance || '0')

  useEffect(() => {
    if (!investModal.isOpen) {
      setInvestmentAmount('')
      setError('')
      setIsSubmitting(false)
    }
  }, [investModal.isOpen])

  const handleInvest = async () => {
    if (!project || !investModal.projectAddress) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await globalActions.makeInvestment(
        project.id,
        investModal.projectAddress,
        investmentAmount
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Investment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!project) return null

  const currentFunding = project.funding?.currentAmount || 0
  const targetFunding = project.funding?.targetAmount || 100
  const progressPercentage = Math.min((currentFunding / targetFunding) * 100, 100)
  const expectedTokens = parseFloat(investmentAmount) * 1000 // Mock calculation

  return (
    <Dialog open={investModal.isOpen} onOpenChange={hideInvestModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              {project.logo ? (
                <img src={project.logo} alt={project.name} className="w-6 h-6 rounded" />
              ) : (
                <div className="w-6 h-6 bg-blue-600 rounded opacity-80" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{project.name}</DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                {project.verification?.verified && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                    Verified
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  {project.backers?.length || 0} backers
                </span>
              </div>
            </div>
          </div>
          <DialogDescription>
            Invest in this project and receive tokens in return
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-gray-700">Funding Progress</span>
              <span className="text-sm font-bold text-blue-600">{progressPercentage.toFixed(1)}%</span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentFunding.toFixed(1)} ETH raised</span>
              <span>of {targetFunding.toFixed(1)} ETH target</span>
            </div>
          </div>

          {/* Investment Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount (ETH)</Label>
              <div className="relative">
                <Input
                  id="investment-amount"
                  type="number"
                  placeholder="0.00"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pr-16 text-right text-lg font-semibold"
                  min="0.01"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm font-medium text-gray-700">ETH</span>
                </div>
              </div>
              
              {/* Wallet Balance */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Available balance:</span>
                <span className="font-medium text-gray-900">{formattedBalance} ETH</span>
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex space-x-2">
                {['0.1', '0.5', '1.0'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setInvestmentAmount(amount)}
                    className="flex-1"
                  >
                    {amount} ETH
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestmentAmount(formattedBalance || '0')}
                  className="flex-1"
                  disabled={!formattedBalance}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Expected Returns */}
            {investmentAmount && parseFloat(investmentAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
              >
                <h4 className="text-sm font-medium text-green-900 mb-2">Expected Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Tokens you'll receive:</span>
                    <span className="font-bold text-green-900">
                      {expectedTokens.toLocaleString()} {project.tokenSymbol || 'TOKENS'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Token price:</span>
                    <span className="font-medium text-green-900">0.001 ETH</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validation Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800"
                >
                  {error}
                </motion.div>
              )}
              
              {investmentAmount && !isValidAmount && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"
                >
                  {parseFloat(investmentAmount) <= 0 
                    ? 'Please enter a valid amount'
                    : 'Insufficient balance'
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={hideInvestModal}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvest}
            disabled={!isConnected || !isValidAmount || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Investing...</span>
              </div>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Invest ${investmentAmount || '0'} ETH`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}