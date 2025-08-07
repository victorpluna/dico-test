'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther, parseEther, type Address } from 'viem'
import { useInvestmentStore, useUserStore, useUIStore, useToast, globalActions } from '@/lib/store'

interface InvestModalProps {
  isOpen: boolean
  onClose: () => void
  projectAddress: Address
  projectName: string
  tokenSymbol?: string
  tokenPrice?: number // ETH per token
  vestingPeriod?: string
}

export function InvestModal({
  isOpen,
  onClose,
  projectAddress,
  projectName,
  tokenSymbol = 'TOKEN',
  tokenPrice = 0.001,
  vestingPeriod = '12 months'
}: InvestModalProps) {
  // Store hooks
  const { pendingTransactions, setTransactionState, clearTransactionState } = useInvestmentStore()
  const { isConnected, address, balance } = useUserStore()
  const { hideInvestModal } = useUIStore()
  const { toast } = useToast()

  // Local state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [amount, setAmount] = useState('')
  const [gasType, setGasType] = useState<'standard' | 'fast'>('standard')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToRisks, setAgreedToRisks] = useState(false)
  
  // Mock gas prices and transaction state
  const standardGas = '0.002'
  const fastGas = '0.005'
  const gasLoading = false
  const formattedBalance = balance ? `${balance.toFixed(4)} ETH` : '0.0000 ETH'
  
  // Get transaction state
  const txId = `invest_${projectAddress}_${Date.now()}`
  const transactionState = pendingTransactions[txId] || { status: 'idle', message: '' }

  // Calculate derived values
  const expectedTokens = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return 0
    return Math.floor(parseFloat(amount) / tokenPrice)
  }, [amount, tokenPrice])

  const totalCost = useMemo(() => {
    if (!amount) return '0.000'
    const gasPrice = gasType === 'fast' ? fastGas : standardGas
    return (parseFloat(amount) + parseFloat(gasPrice)).toFixed(6)
  }, [amount, gasType, standardGas, fastGas])

  const usdValue = useMemo(() => {
    // Mock ETH/USD rate - in production, fetch from API
    const ethPrice = 3500
    if (!amount || isNaN(parseFloat(amount))) return 0
    return parseFloat(amount) * ethPrice
  }, [amount])

  // Validation
  const validation = useMemo(() => {
    const errors = []
    const amountNum = parseFloat(amount)
    
    if (!amount || isNaN(amountNum)) {
      return { isValid: false, errors: ['Please enter a valid amount'] }
    }
    
    if (amountNum < 0.01) {
      errors.push('Minimum investment is 0.01 ETH')
    }
    
    if (balance && amountNum > balance) {
      errors.push('Insufficient balance')
    }
    
    if (amountNum > 100) {
      errors.push('Maximum investment is 100 ETH')
    }
    
    return { isValid: errors.length === 0, errors }
  }, [amount, balance])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setAmount('')
      setGasType('standard')
      setAgreedToTerms(false)
      setAgreedToRisks(false)
    }
  }, [isOpen])

  // Auto-estimate gas when amount changes (mock implementation)
  useEffect(() => {
    // In a real app, this would estimate gas costs
    // For now, we're using mock values
  }, [amount, projectAddress])

  const handleQuickAmount = (value: string) => {
    if (value === 'max') {
      // Use 95% of balance to account for gas fees
      const maxAmount = balance ? (balance * 0.95).toFixed(4) : '0'
      setAmount(maxAmount)
    } else {
      setAmount(value)
    }
  }

  const handleNextStep = () => {
    if (step === 1 && validation.isValid) {
      setStep(2)
    } else if (step === 2 && agreedToTerms && agreedToRisks) {
      setStep(3)
      handleInvest()
    }
  }

  const handleInvest = async () => {
    try {
      setTransactionState(txId, {
        status: 'pending',
        message: 'Initiating investment transaction...'
      })
      
      await globalActions.makeInvestment(
        projectAddress, // Using as project ID for now
        projectAddress,
        amount
      )
      
      setTransactionState(txId, {
        status: 'success',
        message: 'Investment successful!'
      })
      
    } catch (error) {
      setTransactionState(txId, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Investment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleClose = () => {
    if (transactionState.status !== 'pending' && transactionState.status !== 'confirming') {
      clearTransactionState(txId)
      hideInvestModal()
      onClose()
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Invest in {projectName}</h2>
                    <p className="text-sm text-gray-500">
                      Step {step} of 3: {
                        step === 1 ? 'Set Investment Amount' :
                        step === 2 ? 'Review & Confirm' :
                        'Processing Transaction'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={transactionState.status === 'pending' || transactionState.status === 'confirming'}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step 1: Amount Input */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  {/* ETH Amount Input */}
                  <div className="space-y-3">
                    <label htmlFor="eth-amount" className="block text-sm font-medium text-gray-700">
                      Investment Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="eth-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`
                          w-full px-4 py-4 text-2xl font-semibold text-center
                          border-2 rounded-xl pr-16
                          placeholder-gray-300 transition-colors duration-200
                          ${validation.errors.length > 0 
                            ? 'border-red-500 bg-red-50/50 focus:ring-red-600 focus:border-red-600'
                            : 'border-gray-200 focus:ring-blue-600 focus:border-blue-600'
                          }
                          focus:ring-2 focus:ring-offset-0
                        `}
                        min="0.01"
                        max="100"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-lg font-semibold text-gray-700">ETH</span>
                      </div>
                    </div>

                    {/* USD Conversion */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">≈ ${usdValue.toLocaleString()} USD</span>
                    </div>

                    {/* Validation Errors */}
                    {validation.errors.length > 0 && (
                      <div className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                            </svg>
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Wallet Balance */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Wallet Balance:</span>
                      <span className="text-sm font-medium text-gray-900">{formattedBalance} ETH</span>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {['0.1', '0.5', '1', 'max'].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleQuickAmount(value)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100
                                   hover:bg-blue-100 hover:text-blue-700 border border-gray-200 rounded-lg
                                   transition-colors duration-200"
                        >
                          {value === 'max' ? 'Max' : `${value} ETH`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gas Fee Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Network Fee</span>
                      <button className="text-sm text-blue-600 hover:text-blue-700">Advanced</button>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gas"
                            value="standard"
                            checked={gasType === 'standard'}
                            onChange={() => setGasType('standard')}
                            className="text-blue-600"
                          />
                          <span className="text-sm font-medium">Standard</span>
                          <span className="text-xs text-gray-500">(~3 min)</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {gasLoading ? 'Loading...' : `${standardGas} ETH`}
                        </span>
                      </label>

                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gas"
                            value="fast"
                            checked={gasType === 'fast'}
                            onChange={() => setGasType('fast')}
                            className="text-blue-600"
                          />
                          <span className="text-sm font-medium">Fast</span>
                          <span className="text-xs text-gray-500">(~1 min)</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {gasLoading ? 'Loading...' : `${fastGas} ETH`}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  {amount && validation.isValid && (
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <h3 className="text-sm font-medium text-blue-900">Investment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Investment Amount:</span>
                          <span className="font-medium text-blue-900">{amount} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Expected Tokens:</span>
                          <span className="font-medium text-blue-900">{expectedTokens.toLocaleString()} {tokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Network Fee:</span>
                          <span className="font-medium text-blue-900">{gasType === 'fast' ? fastGas : standardGas} ETH</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2 flex justify-between">
                          <span className="font-medium text-blue-900">Total:</span>
                          <span className="font-bold text-blue-900">{totalCost} ETH</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Review & Confirmation */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  {/* Transaction Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Investment</h3>

                    <div className="space-y-4">
                      {/* Project Details */}
                      <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{projectName}</h4>
                          <p className="text-sm text-gray-500">Verified Creator</p>
                        </div>
                      </div>

                      {/* Investment Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Your Investment:</span>
                          <p className="font-semibold text-gray-900">{amount} ETH</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Tokens:</span>
                          <p className="font-semibold text-gray-900">{expectedTokens.toLocaleString()} {tokenSymbol}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vesting Period:</span>
                          <p className="font-semibold text-gray-900">{vestingPeriod}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Network Fee:</span>
                          <p className="font-semibold text-gray-900">{gasType === 'fast' ? fastGas : standardGas} ETH</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Acknowledgment */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Risk Acknowledgment</h3>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={agreedToRisks}
                          onChange={(e) => setAgreedToRisks(e.target.checked)}
                          className="mt-1 text-blue-600 rounded"
                          required
                        />
                        <span className="text-sm text-gray-600">
                          I understand that cryptocurrency investments are high-risk and I may lose all invested funds.
                        </span>
                      </label>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 text-blue-600 rounded"
                          required
                        />
                        <span className="text-sm text-gray-600">
                          I have read and agree to the{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>.
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Processing */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6"
                >
                  <div className="text-center space-y-6">
                    {transactionState.status === 'success' ? (
                      <>
                        {/* Success State */}
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-green-900">Investment Successful!</h3>
                          <p className="text-sm text-green-700">Your investment of {amount} ETH has been confirmed</p>
                        </div>
                        <button
                          onClick={handleClose}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          View in Portfolio
                        </button>
                      </>
                    ) : transactionState.status === 'error' ? (
                      <>
                        {/* Error State */}
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-red-900">Transaction Failed</h3>
                          <p className="text-sm text-red-700">{transactionState.message}</p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Processing State */}
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                          />
                          <div className="absolute inset-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">Processing Investment</h3>
                          <p className="text-sm text-gray-600">{transactionState.message}</p>
                        </div>
                        
                        {transactionState.transactionHash && (
                          <div className="bg-yellow-50 rounded-lg p-4 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-yellow-800">Transaction Pending</span>
                            </div>
                            <p className="text-xs text-yellow-700 font-mono break-all">
                              TX: {transactionState.transactionHash}
                            </p>
                            <a
                              href={`https://etherscan.io/tx/${transactionState.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-yellow-600 hover:text-yellow-700 underline"
                            >
                              View on Etherscan
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Footer Actions */}
              {(step === 1 || step === 2) && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={step === 1 ? handleClose : () => setStep(1)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      {step === 1 ? 'Cancel' : '← Previous'}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={
                        (step === 1 && !validation.isValid) ||
                        (step === 2 && (!agreedToTerms || !agreedToRisks))
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {step === 1 ? 'Review Investment' : 'Confirm Transaction'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}