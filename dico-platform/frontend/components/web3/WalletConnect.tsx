'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWalletConnection, useWalletBalance } from '@/lib/web3/hooks'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WalletConnectProps {
  variant?: 'default' | 'compact' | 'minimal'
  showBalance?: boolean
  className?: string
}

export function WalletConnect({ 
  variant = 'default', 
  showBalance = true, 
  className = '' 
}: WalletConnectProps) {
  const { address, isConnected, shortAddress } = useWalletConnection()
  const { formattedBalance, isLoading: balanceLoading } = useWalletBalance(address)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (variant === 'minimal') {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted
          const connected = ready && account && chain

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className={className}
                    >
                      Connect Wallet
                    </Button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className={className}
                    >
                      Wrong Network
                    </Button>
                  )
                }

                return (
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className={`font-mono text-xs ${className}`}
                  >
                    {account.displayName}
                  </Button>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
    )
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        accountModalOpen,
        chainModalOpen,
        connectModalOpen,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openConnectModal}
                      className="inline-flex items-center space-x-3 px-6 py-3 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Connect Wallet</span>
                    </motion.button>
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button variant="destructive" asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openChainModal}
                      className="inline-flex items-center space-x-3 px-6 py-3 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Wrong Network</span>
                    </motion.button>
                  </Button>
                )
              }

              return (
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="inline-flex items-center space-x-3 px-6 py-3 shadow-sm hover:shadow-md"
                      asChild
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Chain Icon */}
                        {chain.hasIcon && (
                          <div className="w-5 h-5">
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-5 h-5 rounded-full"
                            />
                          </div>
                        )}
                        
                        {/* Account Info */}
                        <div className="flex flex-col items-start min-w-0">
                          <span className="font-mono text-sm text-gray-900">
                            {account.displayName}
                          </span>
                          {showBalance && !balanceLoading && (
                            <span className="text-xs text-gray-500">
                              {formattedBalance} ETH
                            </span>
                          )}
                          {showBalance && balanceLoading && (
                            <span className="text-xs text-gray-400">
                              Loading...
                            </span>
                          )}
                        </div>

                        {/* Dropdown Arrow */}
                        <motion.svg
                          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        {account.ensAvatar && (
                          <img
                            src={account.ensAvatar}
                            alt="Account avatar"
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {account.ensName || 'Anonymous'}
                          </p>
                          <p className="text-xs font-mono text-gray-500">
                            {shortAddress}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        openChainModal()
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Switch Network</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        openAccountModal()
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}