'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWalletConnection, useWalletBalance } from '@/lib/web3/hooks'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className={`
                        inline-flex items-center px-4 py-2 
                        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                        text-white font-medium text-sm rounded-md
                        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                        transition-colors duration-200
                        ${className}
                      `}
                    >
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={`
                        inline-flex items-center px-4 py-2 
                        bg-red-600 hover:bg-red-700 active:bg-red-800
                        text-white font-medium text-sm rounded-md
                        focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2
                        transition-colors duration-200
                        ${className}
                      `}
                    >
                      Wrong Network
                    </button>
                  )
                }

                return (
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={`
                      inline-flex items-center space-x-2 px-4 py-2
                      bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                      text-gray-900 font-medium text-sm rounded-md
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      transition-colors duration-200
                      ${className}
                    `}
                  >
                    <span className="font-mono text-xs">{account.displayName}</span>
                  </button>
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openConnectModal}
                    type="button"
                    className="
                      inline-flex items-center space-x-3 px-6 py-3
                      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                      text-white font-semibold rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      transition-colors duration-200 shadow-md hover:shadow-lg
                    "
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Connect Wallet</span>
                  </motion.button>
                )
              }

              if (chain.unsupported) {
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openChainModal}
                    type="button"
                    className="
                      inline-flex items-center space-x-3 px-6 py-3
                      bg-red-600 hover:bg-red-700 active:bg-red-800
                      text-white font-semibold rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2
                      transition-colors duration-200 shadow-md hover:shadow-lg
                    "
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Wrong Network</span>
                  </motion.button>
                )
              }

              return (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    type="button"
                    className="
                      inline-flex items-center space-x-3 px-6 py-3
                      bg-white hover:bg-gray-50 active:bg-gray-100
                      text-gray-900 font-medium rounded-lg border border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      transition-colors duration-200 shadow-sm hover:shadow-md
                    "
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

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="
                          absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl
                          border border-gray-200 z-50
                        "
                      >
                        <div className="p-4 border-b border-gray-200">
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
                        </div>

                        <div className="p-2">
                          <button
                            onClick={() => {
                              openChainModal()
                              setIsDropdownOpen(false)
                            }}
                            className="
                              w-full flex items-center space-x-3 px-3 py-2
                              text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md
                              transition-colors duration-150
                            "
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Switch Network</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              openAccountModal()
                              setIsDropdownOpen(false)
                            }}
                            className="
                              w-full flex items-center space-x-3 px-3 py-2
                              text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md
                              transition-colors duration-150
                            "
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Account Settings</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Overlay to close dropdown */}
                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}