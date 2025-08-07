'use client'

import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface ProgressBarProps {
  currentAmount: number
  targetAmount: number
  creatorStake: number
  backers: number
  lastUpdated: string
  className?: string
  height?: 'thin' | 'base' | 'thick'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple'
  showTransparency?: boolean
  showMilestones?: boolean
  animated?: boolean
}

interface MilestoneData {
  percentage: number
  label: string
  reached: boolean
}

const ProgressBar = ({
  currentAmount,
  targetAmount,
  creatorStake,
  backers,
  lastUpdated,
  className = '',
  height = 'base',
  variant = 'default',
  showTransparency = true,
  showMilestones = true,
  animated = true
}: ProgressBarProps) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const progressRef = useRef(null)
  const isInView = useInView(progressRef, { once: true, threshold: 0.1 })
  
  // Calculate progress percentage
  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100)
  
  // Calculate skin-in-game percentage
  const skinInGamePercentage = Math.round((creatorStake / targetAmount) * 100)
  
  // Calculate USD values (mock exchange rate)
  const ethToUsd = 3500 // Mock ETH/USD rate
  const currentUsd = currentAmount * ethToUsd
  const targetUsd = targetAmount * ethToUsd
  
  // Determine status
  const getStatus = () => {
    if (progressPercentage >= 100) return 'success'
    if (progressPercentage >= 75) return 'success'
    if (progressPercentage >= 50) return 'warning'
    return 'danger'
  }
  
  const status = getStatus()
  
  // Milestone data
  const milestones: MilestoneData[] = [
    { percentage: 25, label: '25% Milestone', reached: progressPercentage >= 25 },
    { percentage: 50, label: '50% Milestone', reached: progressPercentage >= 50 },
    { percentage: 75, label: '75% Milestone', reached: progressPercentage >= 75 }
  ]
  
  // Height styles
  const heightStyles = {
    thin: { wrapper: 'h-1', fill: 'h-1', marker: 'w-3 h-3' },
    base: { wrapper: 'h-3', fill: 'h-3', marker: 'w-4 h-4' },
    thick: { wrapper: 'h-5', fill: 'h-5', marker: 'w-5 h-5' }
  }
  
  // Variant styles
  const variantStyles = {
    default: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  }
  
  // Status indicator colors
  const statusColors = {
    success: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
    danger: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
  }
  
  const statusColor = statusColors[status as keyof typeof statusColors]
  
  // Animation variants
  const progressFillVariants = {
    initial: {
      width: 0,
      opacity: 0.8
    },
    animate: {
      width: `${progressPercentage}%`,
      opacity: 1,
      transition: {
        width: {
          duration: animated ? 1.5 : 0,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        },
        opacity: {
          duration: animated ? 0.5 : 0
        }
      }
    }
  }
  
  const shimmerVariants = {
    animate: {
      x: ['-100%', '200%'],
      opacity: [0, 1, 0],
      transition: {
        x: {
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 2
        },
        opacity: {
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 2
        }
      }
    }
  }
  
  const milestoneVariants = {
    pending: {
      scale: 1,
      backgroundColor: "rgb(209, 213, 219)",
      borderColor: "rgb(156, 163, 175)",
      opacity: 0.6
    },
    approaching: {
      scale: [1, 1.2, 1],
      backgroundColor: "rgb(59, 130, 246)",
      borderColor: "rgb(37, 99, 235)",
      opacity: 1,
      transition: {
        scale: {
          duration: 1,
          ease: "easeInOut",
          repeat: Infinity
        },
        backgroundColor: {
          duration: 0.3,
          ease: [0.25, 1, 0.5, 1]
        }
      }
    },
    reached: {
      scale: [1, 1.3, 1.1],
      backgroundColor: "rgb(34, 197, 94)",
      borderColor: "rgb(22, 163, 74)",
      opacity: 1,
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  }
  
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  }
  
  const updatePulseVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.6, 1],
      backgroundColor: [
        "rgb(34, 197, 94)",
        "rgb(59, 130, 246)",
        "rgb(34, 197, 94)"
      ],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
  
  useEffect(() => {
    if (isInView && animated) {
      setIsAnimating(true)
    }
  }, [isInView, animated])
  
  return (
    <div className={`space-y-3 ${className}`} ref={progressRef}>
      {/* Header with Labels */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Funding Progress</h3>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
            <motion.div 
              className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`}
              variants={{
                animate: {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }
              }}
              animate="animate"
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
            <span>
              {status === 'success' ? 'On Track' : status === 'warning' ? 'Good Progress' : 'Needs Support'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className={`relative w-full bg-gray-200 rounded-full ${heightStyles[height].wrapper} overflow-hidden`}>
        {/* Background Track */}
        <div className="absolute inset-0 bg-gray-200 rounded-full" />
        
        {/* Animated Fill */}
        <motion.div 
          className={`relative bg-gradient-to-r ${variantStyles[variant]} ${heightStyles[height].fill} rounded-full shadow-sm`}
          variants={progressFillVariants}
          initial="initial"
          animate={isAnimating ? "animate" : "initial"}
          role="progressbar" 
          aria-valuemin="0" 
          aria-valuemax="100" 
          aria-valuenow={Math.round(progressPercentage)}
          aria-label={`Funding progress: ${progressPercentage.toFixed(1)}% complete, ${currentAmount.toFixed(1)} ETH raised of ${targetAmount.toFixed(1)} ETH target`}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          {/* Shimmer Effect */}
          {animated && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
              variants={shimmerVariants}
              animate="animate"
            />
          )}
          
          {/* Progress Glow */}
          <div className={`absolute inset-0 bg-gradient-to-r ${variantStyles[variant].replace('500', '400').replace('600', '500')} rounded-full blur-sm opacity-75`} />
        </motion.div>
        
        {/* Milestone Markers */}
        {showMilestones && (
          <div className="absolute inset-0">
            {milestones.map((milestone, index) => {
              const isApproaching = !milestone.reached && Math.abs(progressPercentage - milestone.percentage) < 5
              const status = milestone.reached ? 'reached' : isApproaching ? 'approaching' : 'pending'
              
              return (
                <motion.div
                  key={milestone.percentage}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10 group"
                  style={{ left: `${milestone.percentage}%` }}
                  onMouseEnter={() => setShowTooltip(milestone.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                  whileHover={{ scale: 1.2 }}
                >
                  <motion.div
                    className={`${heightStyles[height].marker} rounded-full border-2 border-white shadow-md transition-all duration-200`}
                    variants={milestoneVariants}
                    animate={status}
                    initial="pending"
                  />
                  
                  {/* Tooltip */}
                  {showTooltip === milestone.label && (
                    <motion.div
                      className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 pointer-events-none"
                      variants={tooltipVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                        {milestone.label}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
        
        {/* Target Line */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-400" />
      </div>

      {/* Funding Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Raised</span>
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {currentAmount.toFixed(1)} ETH
          </span>
          <span className="text-xs text-gray-500 tabular-nums">
            (${currentUsd.toLocaleString()})
          </span>
        </div>
        <div className="flex flex-col space-y-1 text-right">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target</span>
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {targetAmount.toFixed(1)} ETH
          </span>
          <span className="text-xs text-gray-500 tabular-nums">
            (${targetUsd.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Trust Transparency Features */}
      {showTransparency && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500 font-medium">Verified Funds</span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {currentAmount.toFixed(1)} ETH
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500 font-medium">Creator Stake</span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {creatorStake} ETH ({skinInGamePercentage}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500 font-medium">Backers</span>
                <span className="text-xs font-bold text-gray-900 truncate">
                  {backers} investors
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Updates */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <motion.div 
            className="w-2 h-2 bg-green-400 rounded-full"
            variants={updatePulseVariants}
            animate="animate"
          />
          <span className="text-gray-500">Last updated {lastUpdated}</span>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
            View transactions
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar