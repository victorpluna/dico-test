import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { useCallback, useState, useEffect } from 'react'
import { Address, parseEther, formatEther } from 'viem'
import { useChainId } from 'wagmi'
import { getContractAddresses } from './config'
import { 
  DICO_TOKEN_ABI, 
  DICO_FACTORY_ABI, 
  DICO_PROJECT_ABI, 
  DICO_VESTING_ABI,
  type ProjectInfo,
  type ProjectDetails,
  type InvestmentInfo,
  type VestingInfo,
  type PlatformStats
} from './contract-abis'

// Hook to get contract addresses for current chain
export function useContractAddresses() {
  const chainId = useChainId()
  return getContractAddresses(chainId)
}

// DICO Token Hooks
export function useDicoToken() {
  const addresses = useContractAddresses()
  
  const { data: name } = useReadContract({
    address: addresses.DICO_TOKEN as Address,
    abi: DICO_TOKEN_ABI,
    functionName: 'name',
  })
  
  const { data: symbol } = useReadContract({
    address: addresses.DICO_TOKEN as Address,
    abi: DICO_TOKEN_ABI,
    functionName: 'symbol',
  })
  
  const { data: totalSupply } = useReadContract({
    address: addresses.DICO_TOKEN as Address,
    abi: DICO_TOKEN_ABI,
    functionName: 'totalSupply',
  })
  
  const { data: maxSupply } = useReadContract({
    address: addresses.DICO_TOKEN as Address,
    abi: DICO_TOKEN_ABI,
    functionName: 'MAX_SUPPLY',
  })

  return {
    address: addresses.DICO_TOKEN as Address,
    name,
    symbol,
    totalSupply,
    maxSupply,
    formattedTotalSupply: totalSupply ? formatEther(totalSupply) : '0',
    formattedMaxSupply: maxSupply ? formatEther(maxSupply) : '0',
  }
}

export function useDicoTokenBalance(address?: Address) {
  const tokenAddress = useContractAddresses().DICO_TOKEN as Address
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: DICO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  return {
    balance,
    formattedBalance: balance ? formatEther(balance) : '0',
    isLoading,
    refetch,
  }
}

// DICO Factory Hooks
export function useDicoFactory() {
  const addresses = useContractAddresses()
  
  const { data: platformFeePercentage } = useReadContract({
    address: addresses.DICO_FACTORY as Address,
    abi: DICO_FACTORY_ABI,
    functionName: 'platformFeePercentage',
  })
  
  const { data: projectCreationFee } = useReadContract({
    address: addresses.DICO_FACTORY as Address,
    abi: DICO_FACTORY_ABI,
    functionName: 'projectCreationFee',
  })
  
  const { data: totalProjectsCreated } = useReadContract({
    address: addresses.DICO_FACTORY as Address,
    abi: DICO_FACTORY_ABI,
    functionName: 'totalProjectsCreated',
  })

  const { data: platformStats } = useReadContract({
    address: addresses.DICO_FACTORY as Address,
    abi: DICO_FACTORY_ABI,
    functionName: 'getPlatformStats',
  })

  return {
    address: addresses.DICO_FACTORY as Address,
    platformFeePercentage,
    projectCreationFee,
    totalProjectsCreated,
    platformStats: platformStats as PlatformStats | undefined,
    formattedCreationFee: projectCreationFee ? formatEther(projectCreationFee) : '0',
    formattedPlatformFee: platformFeePercentage ? `${Number(platformFeePercentage) / 100}%` : '0%',
  }
}

export function useFactoryProjects(offset = 0, limit = 10) {
  const factoryAddress = useContractAddresses().DICO_FACTORY as Address
  
  const { data: projects, isLoading, refetch } = useReadContract({
    address: factoryAddress,
    abi: DICO_FACTORY_ABI,
    functionName: 'getProjectsPaginated',
    args: [BigInt(offset), BigInt(limit)],
  })

  return {
    projects: projects as Address[] | undefined,
    isLoading,
    refetch,
  }
}

export function useProjectInfo(projectAddress?: Address) {
  const factoryAddress = useContractAddresses().DICO_FACTORY as Address
  
  const { data: projectInfo, isLoading, refetch } = useReadContract({
    address: factoryAddress,
    abi: DICO_FACTORY_ABI,
    functionName: 'projectInfo',
    args: projectAddress ? [projectAddress] : undefined,
    query: { enabled: !!projectAddress }
  })

  return {
    projectInfo: projectInfo as ProjectInfo | undefined,
    isLoading,
    refetch,
  }
}

export function useCreateProject() {
  const factoryAddress = useContractAddresses().DICO_FACTORY as Address
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createProject = useCallback(async (params: {
    name: string
    symbol: string
    totalSupply: string
    targetAmount: string
    duration: number // in seconds
    tokenPrice: string
    vestingDuration: number // in seconds
    vestingCliff: number // in seconds
    description: string
    creationFee: string
  }) => {
    await writeContract({
      address: factoryAddress,
      abi: DICO_FACTORY_ABI,
      functionName: 'createProject',
      args: [
        params.name,
        params.symbol,
        parseEther(params.totalSupply),
        parseEther(params.targetAmount),
        BigInt(params.duration),
        parseEther(params.tokenPrice),
        BigInt(params.vestingDuration),
        BigInt(params.vestingCliff),
        params.description,
      ],
      value: parseEther(params.creationFee),
    })
  }, [writeContract, factoryAddress])

  return {
    createProject,
    transactionHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// DICO Project Hooks
export function useDicoProject(projectAddress?: Address) {
  const { data: projectDetails, isLoading: isLoadingDetails, refetch } = useReadContract({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    functionName: 'getProjectInfo',
    query: { enabled: !!projectAddress }
  })
  
  const { data: progress } = useReadContract({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    functionName: 'getProgress',
    query: { enabled: !!projectAddress }
  })
  
  const { data: timeRemaining } = useReadContract({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    functionName: 'getTimeRemaining',
    query: { enabled: !!projectAddress }
  })
  
  const { data: isActive } = useReadContract({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    functionName: 'isActive',
    query: { enabled: !!projectAddress }
  })

  return {
    projectDetails: projectDetails as ProjectDetails | undefined,
    progress,
    timeRemaining,
    isActive,
    isLoading: isLoadingDetails,
    refetch,
  }
}

export function useInvestmentInfo(projectAddress?: Address, investorAddress?: Address) {
  const { data: investmentInfo, isLoading, refetch } = useReadContract({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    functionName: 'getInvestmentInfo',
    args: investorAddress ? [investorAddress] : undefined,
    query: { enabled: !!(projectAddress && investorAddress) }
  })

  return {
    investmentInfo: investmentInfo as InvestmentInfo | undefined,
    isLoading,
    refetch,
  }
}

export function useInvestInProject(projectAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const invest = useCallback(async (amount: string) => {
    if (!projectAddress) throw new Error('Project address is required')
    
    await writeContract({
      address: projectAddress,
      abi: DICO_PROJECT_ABI,
      functionName: 'invest',
      value: parseEther(amount),
    })
  }, [writeContract, projectAddress])

  return {
    invest,
    transactionHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useClaimTokens(projectAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const claimTokens = useCallback(async () => {
    if (!projectAddress) throw new Error('Project address is required')
    
    await writeContract({
      address: projectAddress,
      abi: DICO_PROJECT_ABI,
      functionName: 'claimTokens',
    })
  }, [writeContract, projectAddress])

  return {
    claimTokens,
    transactionHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useClaimRefund(projectAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const claimRefund = useCallback(async () => {
    if (!projectAddress) throw new Error('Project address is required')
    
    await writeContract({
      address: projectAddress,
      abi: DICO_PROJECT_ABI,
      functionName: 'claimRefund',
    })
  }, [writeContract, projectAddress])

  return {
    claimRefund,
    transactionHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// DICO Vesting Hooks
export function useVestingInfo(vestingAddress?: Address, beneficiaryAddress?: Address) {
  const { data: vestingInfo, isLoading, refetch } = useReadContract({
    address: vestingAddress,
    abi: DICO_VESTING_ABI,
    functionName: 'getVestingInfo',
    args: beneficiaryAddress ? [beneficiaryAddress] : undefined,
    query: { enabled: !!(vestingAddress && beneficiaryAddress) }
  })

  const { data: claimableAmount } = useReadContract({
    address: vestingAddress,
    abi: DICO_VESTING_ABI,
    functionName: 'getClaimableAmount',
    args: beneficiaryAddress ? [beneficiaryAddress] : undefined,
    query: { enabled: !!(vestingAddress && beneficiaryAddress) }
  })

  return {
    vestingInfo: vestingInfo as VestingInfo | undefined,
    claimableAmount,
    formattedClaimableAmount: claimableAmount ? formatEther(claimableAmount) : '0',
    isLoading,
    refetch,
  }
}

export function useClaimVestedTokens(vestingAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const claimVestedTokens = useCallback(async () => {
    if (!vestingAddress) throw new Error('Vesting address is required')
    
    await writeContract({
      address: vestingAddress,
      abi: DICO_VESTING_ABI,
      functionName: 'claimTokens',
    })
  }, [writeContract, vestingAddress])

  return {
    claimVestedTokens,
    transactionHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Event Watching Hooks
export function useWatchProjectCreated(factoryAddress?: Address) {
  const [events, setEvents] = useState<any[]>([])

  useWatchContractEvent({
    address: factoryAddress,
    abi: DICO_FACTORY_ABI,
    eventName: 'ProjectCreated',
    onLogs: (logs) => {
      setEvents(prev => [...prev, ...logs])
    },
    enabled: !!factoryAddress,
  })

  return { events }
}

export function useWatchInvestmentMade(projectAddress?: Address) {
  const [events, setEvents] = useState<any[]>([])

  useWatchContractEvent({
    address: projectAddress,
    abi: DICO_PROJECT_ABI,
    eventName: 'InvestmentMade',
    onLogs: (logs) => {
      setEvents(prev => [...prev, ...logs])
    },
    enabled: !!projectAddress,
  })

  return { events }
}

// Combined hook for complete project data
export function useCompleteProjectData(projectAddress?: Address, userAddress?: Address) {
  const { projectDetails, progress, timeRemaining, isActive, isLoading: isLoadingProject } = useDicoProject(projectAddress)
  const { projectInfo, isLoading: isLoadingInfo } = useProjectInfo(projectAddress)
  const { investmentInfo, isLoading: isLoadingInvestment } = useInvestmentInfo(projectAddress, userAddress)

  return {
    projectDetails,
    projectInfo,
    investmentInfo,
    progress,
    timeRemaining,
    isActive,
    isLoading: isLoadingProject || isLoadingInfo || isLoadingInvestment,
  }
}