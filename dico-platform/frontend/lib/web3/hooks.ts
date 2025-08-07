import { useAccount, useBalance, useSignMessage, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { useState, useCallback, useMemo } from 'react'
import { GAS_SETTINGS, TRANSACTION_TIMEOUT } from './config'

// Custom hook for wallet connection state
export function useWalletConnection() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  
  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined,
  }
}

// Custom hook for wallet balance with formatting
export function useWalletBalance(address?: Address) {
  const { data: balance, isLoading, isError, refetch } = useBalance({
    address,
  })

  const formattedBalance = useMemo(() => {
    if (!balance) return '0.00'
    const formatted = formatEther(balance.value)
    return parseFloat(formatted).toFixed(4)
  }, [balance])

  return {
    balance: balance?.value,
    formattedBalance,
    symbol: balance?.symbol || 'ETH',
    isLoading,
    isError,
    refetch,
  }
}

// Custom hook for gas estimation and transaction fees
export function useGasEstimation() {
  const [gasEstimate, setGasEstimate] = useState<{
    standard: string
    fast: string
    isLoading: boolean
    error?: string
  }>({
    standard: '0.004',
    fast: '0.008',
    isLoading: false,
  })

  const estimateGas = useCallback(async (to: Address, value: string, data?: string) => {
    setGasEstimate(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // In a real implementation, you would use the provider to estimate gas
      // For now, we'll use mock values based on typical transaction costs
      const baseGas = parseEther('0.004')
      const standardMultiplier = BigInt(Math.floor(GAS_SETTINGS.STANDARD_MULTIPLIER * 100))
      const fastMultiplier = BigInt(Math.floor(GAS_SETTINGS.FAST_MULTIPLIER * 100))
      const hundredBigInt = BigInt(100)
      
      const standard = formatEther(baseGas * standardMultiplier / hundredBigInt)
      const fast = formatEther(baseGas * fastMultiplier / hundredBigInt)
      
      setGasEstimate({
        standard,
        fast,
        isLoading: false,
      })
      
      return { standard, fast }
    } catch (error) {
      setGasEstimate(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gas estimation failed',
      }))
      throw error
    }
  }, [])

  return {
    ...gasEstimate,
    estimateGas,
  }
}

// Custom hook for transaction handling with status tracking
export function useTransactionHandler() {
  const { sendTransaction, data: hash, isPending, isError, error } = useSendTransaction()
  const { 
    data: receipt, 
    isLoading: isConfirming, 
    isSuccess,
    isError: isReceiptError 
  } = useWaitForTransactionReceipt({
    hash,
    timeout: TRANSACTION_TIMEOUT,
  })

  const [transactionState, setTransactionState] = useState<{
    status: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error'
    message?: string
  }>({ status: 'idle' })

  const sendTransactionWithTracking = useCallback(async (params: {
    to: Address
    value: string
    gasLimit?: bigint
    gasPrice?: bigint
  }) => {
    try {
      setTransactionState({ status: 'preparing', message: 'Preparing transaction...' })
      
      await sendTransaction({
        to: params.to,
        value: parseEther(params.value),
        gas: params.gasLimit,
        gasPrice: params.gasPrice,
      })
      
      setTransactionState({ status: 'pending', message: 'Waiting for wallet confirmation...' })
    } catch (error) {
      setTransactionState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Transaction failed' 
      })
      throw error
    }
  }, [sendTransaction])

  // Update transaction state based on wagmi hooks
  useMemo(() => {
    if (isPending) {
      setTransactionState({ status: 'pending', message: 'Waiting for wallet confirmation...' })
    } else if (isConfirming) {
      setTransactionState({ status: 'confirming', message: 'Transaction submitted, waiting for confirmation...' })
    } else if (isSuccess) {
      setTransactionState({ status: 'success', message: 'Transaction confirmed!' })
    } else if (isError || isReceiptError) {
      setTransactionState({ 
        status: 'error', 
        message: error?.message || 'Transaction failed' 
      })
    }
  }, [isPending, isConfirming, isSuccess, isError, isReceiptError, error])

  return {
    sendTransaction: sendTransactionWithTracking,
    transactionHash: hash,
    receipt,
    ...transactionState,
    isIdle: transactionState.status === 'idle',
    isPreparing: transactionState.status === 'preparing',
    isPending: transactionState.status === 'pending',
    isConfirming: transactionState.status === 'confirming',
    isSuccess: transactionState.status === 'success',
    isError: transactionState.status === 'error',
    reset: () => setTransactionState({ status: 'idle' }),
  }
}

// Custom hook for investment transactions specifically
export function useInvestment() {
  const { address } = useWalletConnection()
  const { balance } = useWalletBalance(address)
  const { estimateGas } = useGasEstimation()
  const transactionHandler = useTransactionHandler()

  const validateInvestmentAmount = useCallback((amount: string) => {
    const errors: string[] = []
    
    if (!amount || parseFloat(amount) <= 0) {
      errors.push('Amount must be greater than 0')
    }
    
    if (balance && parseEther(amount) > balance) {
      errors.push('Insufficient balance')
    }
    
    if (parseFloat(amount) < 0.01) {
      errors.push('Minimum investment is 0.01 ETH')
    }
    
    if (parseFloat(amount) > 100) {
      errors.push('Maximum investment is 100 ETH')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [balance])

  const invest = useCallback(async (projectAddress: Address, amount: string) => {
    const validation = validateInvestmentAmount(amount)
    if (!validation.isValid) {
      throw new Error(validation.errors[0])
    }

    // Estimate gas for the investment transaction
    await estimateGas(projectAddress, amount)
    
    // Send the investment transaction
    return transactionHandler.sendTransaction({
      to: projectAddress,
      value: amount,
    })
  }, [validateInvestmentAmount, estimateGas, transactionHandler.sendTransaction])

  return {
    invest,
    validateInvestmentAmount,
    ...transactionHandler,
  }
}

// Custom hook for claim transactions
export function useClaim() {
  const transactionHandler = useTransactionHandler()

  const claim = useCallback(async (projectAddress: Address) => {
    // In a real implementation, this would call the claim function on the contract
    return transactionHandler.sendTransaction({
      to: projectAddress,
      value: '0', // No ETH sent for claim transactions
    })
  }, [transactionHandler.sendTransaction])

  return {
    claim,
    ...transactionHandler,
  }
}

// Hook for error handling with user-friendly messages
export function useWeb3Error(error?: Error) {
  return useMemo(() => {
    if (!error) return null

    const message = error.message.toLowerCase()
    
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was cancelled by user'
    }
    
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction'
    }
    
    if (message.includes('gas')) {
      return 'Transaction failed due to gas estimation issues'
    }
    
    if (message.includes('network')) {
      return 'Network error occurred'
    }
    
    return 'Transaction failed. Please try again.'
  }, [error])
}