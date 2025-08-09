'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUIStore } from '@/lib/store'
import type { Project } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Updated props to accept either individual props or a Project object
interface ProjectCardProps {
  project?: Project
  // Legacy props for backward compatibility
  projectName?: string
  logo?: string
  currentFunding?: number
  targetFunding?: number
  timeRemaining?: {
    days: number
    hours: number
    minutes: number
  }
  ownFunding?: number
  backers?: number
  verified?: boolean
  lastUpdated?: string
  onCardClick?: () => void
  cardIndex?: number
}

const ProjectCard = ({
  project,
  projectName: legacyProjectName,
  logo: legacyLogo,
  currentFunding: legacyCurrentFunding,
  targetFunding: legacyTargetFunding,
  timeRemaining: legacyTimeRemaining,
  ownFunding: legacyOwnFunding,
  backers: legacyBackers,
  verified: legacyVerified,
  lastUpdated: legacyLastUpdated,
  onCardClick,
  cardIndex = 0
}: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { showInvestModal } = useUIStore()
  
  // Use project data if provided, otherwise fall back to individual props (for backward compatibility)
  const projectName = project?.name || legacyProjectName || 'Unknown Project'
  const logo = project?.logo || legacyLogo
  const currentFunding = project?.funding.currentAmount || legacyCurrentFunding || 0
  const targetFunding = project?.funding.targetAmount || legacyTargetFunding || 100
  const ownFunding = project?.funding.ownFunding || legacyOwnFunding || 0
  const backers = project?.backers.length || legacyBackers || 0
  const verified = project?.verification.verified || legacyVerified || false
  const lastUpdated = legacyLastUpdated || 'recently'
  
  // Calculate time remaining from project timeline or use provided value
  const timeRemaining = legacyTimeRemaining || (project ? calculateTimeRemaining(project.timeline.endDate) : { days: 0, hours: 0, minutes: 0 })
  
  // Helper function to calculate time remaining
  function calculateTimeRemaining(endDate: Date) {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 }
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days, hours, minutes }
  }
  
  // Calculate progress percentage
  const progressPercentage = Math.min((currentFunding / targetFunding) * 100, 100)
  
  // Calculate skin-in-game percentage
  const skinInGamePercentage = Math.round((ownFunding / targetFunding) * 100)
  
  // Determine urgency level based on time remaining
  const totalHours = timeRemaining.days * 24 + timeRemaining.hours
  const urgencyLevel = totalHours > 720 ? 'healthy' : totalHours > 168 ? 'warning' : 'critical'
  const urgencyColors = {
    healthy: { bg: 'bg-green-50/80', text: 'text-green-800', border: 'border-green-200/50' },
    warning: { bg: 'bg-amber-50/80', text: 'text-amber-800', border: 'border-amber-200/50' },
    critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' }
  }
  
  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: cardIndex * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
  
  const cardHoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderColor: "rgba(229, 231, 235, 0.5)"
    },
    hover: {
      scale: 1.02,
      y: -4,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      borderColor: "rgba(96, 165, 250, 0.6)",
      transition: {
        duration: 0.2,
        ease: [0.25, 1, 0.5, 1]
      }
    },
    tap: {
      scale: 0.98,
      y: -2,
      transition: {
        duration: 0.1,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  }
  
  const progressBarVariants = {
    initial: { 
      width: 0,
      opacity: 0.7
    },
    animate: {
      width: `${progressPercentage}%`,
      opacity: 1,
      transition: {
        width: {
          duration: 1.2,
          ease: [0.0, 0.0, 0.2, 1],
          delay: 0.3
        },
        opacity: {
          duration: 0.4,
          delay: 0.2
        }
      }
    }
  }
  
  const shimmerVariants = {
    animate: {
      x: ['-100%', '300%'],
      transition: {
        x: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
          repeatDelay: 1
        }
      }
    }
  }
  
  const badgeVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0 
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        delay: 0.6,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  }
  
  const glowVariants = {
    rest: {
      opacity: 0,
      scale: 0.8
    },
    hover: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.8, 0.25, 1]
      }
    }
  }
  
  return (
    <Card asChild>
      <motion.div
        className="bg-card/90 backdrop-blur-sm transition-all duration-300 cursor-pointer relative overflow-hidden group border-border hover:border-primary/50"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        onClick={() => {
          if (project && project.smartContractAddress) {
            showInvestModal(project.id, project.smartContractAddress as any)
          } else {
            onCardClick?.()
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Project: ${projectName}, ${progressPercentage.toFixed(1)}% funded, ${timeRemaining.days} days remaining`}
        aria-describedby="project-details"
        style={{
          ...(isHovered ? cardHoverVariants.hover : cardHoverVariants.rest)
        }}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Header Section */}
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center space-x-3">
            {/* Logo/Project Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={`${projectName} logo`} className="w-6 h-6 rounded" />
              ) : (
                <div className="w-6 h-6 bg-primary rounded opacity-80" />
              )}
            </div>
            <CardTitle className="text-lg line-clamp-1">{projectName}</CardTitle>
          </div>
          
          {/* Verification Badge */}
          {verified && (
            <Badge 
              variant="secondary"
              className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 w-fit"
              asChild
            >
              <motion.span 
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </motion.span>
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10 pt-0">
          {/* Progress Section (Primary Prominence) */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-muted-foreground">Funding Progress</span>
              <span className="text-lg font-bold text-primary">{progressPercentage.toFixed(1)}%</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-muted"
                aria-label={`Funding progress: ${progressPercentage.toFixed(1)}% of target reached`}
              />
              
              {/* Custom animated overlay for the progress */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full relative"
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Progress Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer" />
                  
                  {/* Shimmer Animation */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                    variants={shimmerVariants}
                    animate="animate"
                  />
                </motion.div>
              </div>
              
              {/* Milestone Markers */}
              <div className="absolute top-0 left-1/4 w-0.5 h-3 bg-muted-foreground opacity-50" />
              <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-muted-foreground opacity-50" />
              <div className="absolute top-0 left-3/4 w-0.5 h-3 bg-muted-foreground opacity-50" />
            </div>
            
            {/* Funding Amounts */}
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">{currentFunding.toFixed(1)} ETH raised</span>
              <span className="text-muted-foreground">of {targetFunding.toFixed(1)} ETH target</span>
            </div>
          </div>
          
          {/* Trust Signals Section */}
          <div className="space-y-3">
            {/* Own Funding (Skin in Game) */}
            <div className="flex items-center justify-between py-2 px-3 bg-green-50/80 rounded-lg">
              <span className="text-sm text-green-700 font-medium">Creator invested: {ownFunding} ETH</span>
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-50 hover:bg-green-50 border-green-200">
                {skinInGamePercentage}% skin-in-game
              </Badge>
            </div>
            
            {/* Backer Count and Updates */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">{backers} backers</span>
              </span>
              <span className="flex items-center space-x-1">
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
                <span>Updated {lastUpdated}</span>
              </span>
            </div>
          </div>
          
          {/* Time Remaining (Urgency Colors) */}
          <div className="countdown-container">
            <div className={`text-center py-3 px-4 ${urgencyColors[urgencyLevel].bg} rounded-lg border ${urgencyColors[urgencyLevel].border}`}>
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-sm font-semibold ${urgencyColors[urgencyLevel].text}`}>
                  {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                </span>
                <motion.div 
                  className={`w-2 h-2 rounded-full ${urgencyLevel === 'healthy' ? 'bg-green-500' : urgencyLevel === 'warning' ? 'bg-amber-500' : 'bg-destructive'}`}
                  animate={urgencyLevel === 'critical' ? {
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.3, 1]
                  } : urgencyLevel === 'warning' ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  } : {}}
                  transition={{
                    duration: urgencyLevel === 'critical' ? 0.8 : 1.5,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
              </div>
              <div className={`text-xs ${urgencyColors[urgencyLevel].text.replace('800', '600')} mt-1`}>
                {urgencyLevel === 'healthy' ? 'Healthy timeline' : urgencyLevel === 'warning' ? 'Limited time' : 'Urgent deadline'}
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Hover Glow Effect */}
        <motion.div 
          className="absolute inset-0 rounded-xl opacity-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse-slow pointer-events-none"
          variants={glowVariants}
          initial="rest"
          animate={isHovered ? "hover" : "rest"}
        />
      </motion.div>
    </Card>
  )
}

export default ProjectCard