'use client'

import { useEffect } from 'react'
import { globalActions, useUserStore, subscribeToStore } from '@/lib/store'

interface StoreProviderProps {
  children: React.ReactNode
}

/**
 * StoreProvider component that initializes the app state and handles store synchronization
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const { isConnected, address } = useUserStore()

  // Initialize app on mount
  useEffect(() => {
    globalActions.initializeApp()
  }, [])

  // Sync wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet connected:', address)
      // Additional wallet connection logic can be added here
    } else {
      console.log('Wallet disconnected')
    }
  }, [isConnected, address])

  // Set up store subscriptions for debugging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Subscribe to wallet connection changes
      const unsubscribeWallet = subscribeToStore.walletConnection(
        (isConnected, address) => {
          console.log('Wallet state changed:', { isConnected, address })
        }
      )

      // Subscribe to loading state changes
      const unsubscribeLoading = subscribeToStore.loading((isLoading) => {
        if (isLoading) {
          console.log('App is loading...')
        }
      })

      return () => {
        unsubscribeWallet()
        unsubscribeLoading()
      }
    }
  }, [])

  return <>{children}</>
}

export default StoreProvider