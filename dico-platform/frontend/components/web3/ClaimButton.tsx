'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClaim, useWalletConnection } from '@/lib/web3/hooks'
import { type Address } from 'viem'

interface ClaimButtonProps {
  projectAddress: Address
  claimableAmount: string
  tokenSymbol: string
  vestingInfo?: {
    totalAmount: string
    claimedAmount: string
    nextUnlock?: Date
    isVested: boolean
  }
  disabled?: boolean
  className?: string
}

export function ClaimButton({
  projectAddress,
  claimableAmount,
  tokenSymbol,
  vestingInfo,
  disabled = false,
  className = ''
}: ClaimButtonProps) {
  const { address, isConnected } = useWalletConnection()
  const { claim, ...transactionState } = useClaim()
  const [showDetails, setShowDetails] = useState(false)

  const canClaim = parseFloat(claimableAmount) > 0 && !disabled && isConnected
  const isLoading = transactionState.status === 'pending' || transactionState.status === 'confirming'
  const isSuccess = transactionState.status === 'success'
  const isError = transactionState.status === 'error'

  const handleClaim = async () => {
    if (!canClaim) return

    try {
      await claim(projectAddress)
    } catch (error) {
      console.error('Claim failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-500 mb-2">Connect your wallet to claim tokens</p>
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
        >
          Connect Wallet Required
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Claimable Amount Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800">Available to Claim</span>
          {vestingInfo && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-green-900">
            {parseFloat(claimableAmount).toLocaleString()}
          </span>
          <span className="text-lg text-green-700 font-medium">{tokenSymbol}</span>
        </div>
      </div>

      {/* Vesting Details */}
      <AnimatePresence>
        {showDetails && vestingInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-3 overflow-hidden"
          >
            <h4 className="text-sm font-medium text-gray-900">Vesting Schedule</h4>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Claimed</span>
                <span>
                  {parseFloat(vestingInfo.claimedAmount).toLocaleString()} / {parseFloat(vestingInfo.totalAmount).toLocaleString()} {tokenSymbol}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(parseFloat(vestingInfo.claimedAmount) / parseFloat(vestingInfo.totalAmount)) * 100}%`
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Vesting Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Allocation:</span>
                <p className="font-medium text-gray-900">
                  {parseFloat(vestingInfo.totalAmount).toLocaleString()} {tokenSymbol}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Already Claimed:</span>
                <p className="font-medium text-gray-900">
                  {parseFloat(vestingInfo.claimedAmount).toLocaleString()} {tokenSymbol}
                </p>
              </div>
              {vestingInfo.nextUnlock && (
                <div className="col-span-2">
                  <span className="text-gray-500">Next Unlock:</span>
                  <p className="font-medium text-gray-900">
                    {vestingInfo.nextUnlock.toLocaleDateString()} at {vestingInfo.nextUnlock.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {/* Vesting Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                vestingInfo.isVested ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span className="text-xs text-gray-600">
                {vestingInfo.isVested ? 'Fully Vested' : 'Vesting in Progress'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Button */}
      <motion.button
        whileHover={canClaim && !isLoading ? { scale: 1.02 } : {}}
        whileTap={canClaim && !isLoading ? { scale: 0.98 } : {}}
        onClick={handleClaim}
        disabled={!canClaim || isLoading}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-center
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${!canClaim || isLoading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isSuccess
            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            : isError
            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            <span>
              {transactionState.status === 'pending' 
                ? 'Confirm in Wallet...' 
                : 'Processing Claim...'}
            </span>
          </div>
        ) : isSuccess ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </motion.svg>
            <span>Claim Successful!</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            <span>Claim Failed - Try Again</span>
          </div>
        ) : parseFloat(claimableAmount) === 0 ? (
          'No Tokens Available'
        ) : (
          `Claim ${parseFloat(claimableAmount).toLocaleString()} ${tokenSymbol}`
        )}
      </motion.button>

      {/* Transaction Status */}
      <AnimatePresence>
        {transactionState.status !== 'idle' && transactionState.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              p-3 rounded-lg text-sm
              ${isSuccess 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
              }
            `}
          >
            <div className="flex items-start space-x-2">
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className={`
                    w-4 h-4 border-2 border-current border-t-transparent rounded-full mt-0.5 flex-shrink-0
                  `}
                />
              )}
              {isSuccess && (
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isError && (
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-medium">{transactionState.message}</p>
                {transactionState.transactionHash && (
                  <div className="mt-1">
                    <p className="text-xs font-mono opacity-75 break-all">
                      TX: {transactionState.transactionHash}
                    </p>
                    <a
                      href={`https://etherscan.io/tx/${transactionState.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline hover:no-underline mt-1 inline-block"
                    >
                      View on Etherscan →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      {(isSuccess || isError) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => {
            transactionState.reset()
            setShowDetails(false)
          }}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 
                     border border-gray-200 hover:border-gray-300 rounded-lg
                     transition-colors duration-200"
        >
          {isSuccess ? 'Claim More Tokens' : 'Dismiss'}
        </motion.button>
      )}
    </div>
  )
}