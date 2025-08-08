'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  endDate: Date
  size?: 'small' | 'base' | 'large'
  format?: 'inline' | 'block' | 'compact'
  showSeconds?: boolean
  className?: string
  onComplete?: () => void
}

type UrgencyLevel = 'healthy' | 'warning' | 'critical'

const CountdownTimer = ({
  endDate,
  size = 'base',
  format = 'inline',
  showSeconds = false,
  className = '',
  onComplete
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [previousTime, setPreviousTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isComplete, setIsComplete] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('healthy')
  
  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = new Date().getTime()
    const target = endDate.getTime()
    const difference = target - now
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)
    
    return { days, hours, minutes, seconds }
  }, [endDate])
  
  const getUrgencyLevel = useCallback((time: TimeRemaining): UrgencyLevel => {
    const totalHours = time.days * 24 + time.hours
    if (totalHours > 720) return 'healthy' // >30 days
    if (totalHours > 168) return 'warning' // 7-30 days
    return 'critical' // <7 days
  }, [])
  
  useEffect(() => {
    const updateTimer = () => {
      const newTime = calculateTimeRemaining()
      const newUrgency = getUrgencyLevel(newTime)
      
      // Check if time is complete
      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        if (!isComplete) {
          setIsComplete(true)
          onComplete?.()
        }
        return
      }
      
      setPreviousTime(timeRemaining)
      setTimeRemaining(newTime)
      
      // Update urgency level with animation trigger if changed
      if (newUrgency !== urgencyLevel) {
        setUrgencyLevel(newUrgency)
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [calculateTimeRemaining, getUrgencyLevel, timeRemaining, urgencyLevel, isComplete, onComplete])
  
  // Size configurations
  const sizeConfig = {
    small: {
      containerClass: 'px-3 py-1 text-sm space-x-1',
      numberClass: 'text-lg',
      unitClass: 'text-xs',
      separatorClass: 'text-base',
      labelClass: 'text-xs'
    },
    base: {
      containerClass: 'px-4 py-2 text-base space-x-2',
      numberClass: 'text-2xl',
      unitClass: 'text-sm',
      separatorClass: 'text-xl',
      labelClass: 'text-xs'
    },
    large: {
      containerClass: 'px-6 py-3 text-lg space-x-3',
      numberClass: 'text-4xl',
      unitClass: 'text-base',
      separatorClass: 'text-3xl',
      labelClass: 'text-sm'
    }
  }
  
  // Urgency color configurations
  const urgencyColors = {
    healthy: {
      bg: 'bg-green-50/80 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200/50 dark:border-green-700/50',
      dot: 'bg-green-400',
      label: 'Healthy timeline',
      variant: 'secondary' as const
    },
    warning: {
      bg: 'bg-amber-50/80 dark:bg-amber-900/20',
      text: 'text-amber-800 dark:text-amber-200',
      border: 'border-amber-200/50 dark:border-amber-700/50',
      dot: 'bg-amber-400',
      label: 'Limited time',
      variant: 'outline' as const
    },
    critical: {
      bg: 'bg-red-50/80 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200/50 dark:border-red-700/50',
      dot: 'bg-red-400',
      label: 'Urgent deadline',
      variant: 'destructive' as const
    }
  }
  
  const config = sizeConfig[size]
  const colors = urgencyColors[urgencyLevel]
  
  // Animation variants
  const containerVariants = {
    healthy: {
      backgroundColor: "rgb(240, 253, 244, 0.8)",
      borderColor: "rgb(34, 197, 94, 0.5)",
      color: "rgb(22, 101, 52)",
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    warning: {
      backgroundColor: "rgb(255, 251, 235, 0.8)",
      borderColor: "rgb(245, 158, 11, 0.5)",
      color: "rgb(146, 64, 14)",
      scale: 1.02,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    critical: {
      backgroundColor: "rgb(254, 242, 242, 0.8)",
      borderColor: "rgb(239, 68, 68, 0.5)",
      color: "rgb(153, 27, 27)",
      scale: [1, 1.05, 1],
      transition: {
        scale: {
          duration: 1,
          ease: "easeInOut",
          repeat: Infinity
        },
        backgroundColor: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    }
  }
  
  const numberFlipVariants = {
    initial: {
      rotateX: 0,
      opacity: 1
    },
    flip: {
      rotateX: [0, 90, 0],
      opacity: [1, 0, 1],
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.5, 1]
      }
    }
  }
  
  const urgencyDotVariants = {
    healthy: {
      scale: 1,
      opacity: 1,
      backgroundColor: "rgb(34, 197, 94)"
    },
    warning: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      backgroundColor: "rgb(245, 158, 11)",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    },
    critical: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.3, 1],
      backgroundColor: "rgb(239, 68, 68)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
  
  // Number display component with flip animation
  const NumberDisplay = ({ 
    value, 
    previousValue, 
    unit 
  }: { 
    value: number
    previousValue: number
    unit: string 
  }) => {
    const shouldFlip = value !== previousValue
    
    return (
      <div className="timer-segment flex items-baseline space-x-1">
        <div className="relative overflow-hidden">
          <motion.span 
            key={value}
            className={`${config.numberClass} font-bold tabular-nums block`}
            variants={numberFlipVariants}
            initial="initial"
            animate={shouldFlip ? "flip" : "initial"}
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </div>
        <span className={`${config.unitClass} font-medium opacity-75`}>
          {unit}
        </span>
      </div>
    )
  }
  
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        role="timer"
        aria-label="Campaign has ended"
      >
        <Badge variant="secondary" className={`inline-flex items-center justify-center px-4 py-2 ${className}`}>
          <Clock className="w-4 h-4 mr-2" />
          Campaign Ended
        </Badge>
      </motion.div>
    )
  }
  
  if (format === 'inline') {
    return (
      <motion.div
        variants={containerVariants}
        animate={urgencyLevel}
        role="timer"
        aria-label={`Time remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes`}
        aria-live="polite"
        aria-atomic="true"
        tabIndex={0}
      >
        <Badge 
          variant={colors.variant}
          className={`inline-flex items-center justify-center transition-colors duration-300 ${config.containerClass} ${className}`}
        >
        {/* Timer Segments */}
        <NumberDisplay 
          value={timeRemaining.days} 
          previousValue={previousTime.days}
          unit="d" 
        />
        
        <span className={`${config.separatorClass} font-bold opacity-50`}>:</span>
        
        <NumberDisplay 
          value={timeRemaining.hours} 
          previousValue={previousTime.hours}
          unit="h" 
        />
        
        <span className={`${config.separatorClass} font-bold opacity-50`}>:</span>
        
        <NumberDisplay 
          value={timeRemaining.minutes} 
          previousValue={previousTime.minutes}
          unit="m" 
        />
        
        {showSeconds && (
          <>
            <span className={`${config.separatorClass} font-bold opacity-50`}>:</span>
            <NumberDisplay 
              value={timeRemaining.seconds} 
              previousValue={previousTime.seconds}
              unit="s" 
            />
          </>
        )}
        
        {/* Urgency Indicator */}
        <div className="urgency-indicator flex items-center space-x-2 ml-3">
          <motion.div 
            className={`w-2 h-2 rounded-full`}
            variants={urgencyDotVariants}
            animate={urgencyLevel}
          />
          {size !== 'small' && (
            <span className={`${config.labelClass} font-medium`}>
              {colors.label}
            </span>
          )}
        </div>
        </Badge>
      </motion.div>
    )
  }
  
  if (format === 'block') {
    return (
      <motion.div
        variants={containerVariants}
        animate={urgencyLevel}
        role="timer"
        aria-label={`Time remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes`}
        aria-live="polite"
        aria-atomic="true"
        tabIndex={0}
      >
        <Card className={`${className}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <Badge variant={colors.variant} className="flex items-center space-x-1">
                <motion.div 
                  className={`w-1.5 h-1.5 rounded-full`}
                  variants={urgencyDotVariants}
                  animate={urgencyLevel}
                />
                <span>{colors.label}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
        
        {/* Timer Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold tabular-nums text-foreground"
              key={timeRemaining.days}
              variants={numberFlipVariants}
              initial="initial"
              animate={timeRemaining.days !== previousTime.days ? "flip" : "initial"}
            >
              {timeRemaining.days}
            </motion.div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Days</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold tabular-nums text-foreground"
              key={timeRemaining.hours}
              variants={numberFlipVariants}
              initial="initial"
              animate={timeRemaining.hours !== previousTime.hours ? "flip" : "initial"}
            >
              {timeRemaining.hours.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hours</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold tabular-nums text-foreground"
              key={timeRemaining.minutes}
              variants={numberFlipVariants}
              initial="initial"
              animate={timeRemaining.minutes !== previousTime.minutes ? "flip" : "initial"}
            >
              {timeRemaining.minutes.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Minutes</div>
          </div>
        </div>
        
        {/* Timer Progress */}
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Progress 
              value={Math.max(0, 100 - (timeRemaining.days * 24 + timeRemaining.hours) / (30 * 24) * 100)} // Assuming 30-day campaign
              className="w-full h-1"
            />
          </motion.div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started</span>
            <span>Deadline</span>
          </div>
        </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  
  // Compact format
  return (
    <motion.div
      className={`inline-flex items-center text-sm font-semibold text-foreground ${className}`}
      variants={containerVariants}
      animate={urgencyLevel}
      role="timer"
      aria-label={`Time remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes`}
      aria-live="polite"
      aria-atomic="true"
    >
      <time dateTime={`P${timeRemaining.days}DT${timeRemaining.hours}H${timeRemaining.minutes}M`}>
        <NumberDisplay 
          value={timeRemaining.days} 
          previousValue={previousTime.days}
          unit="d" 
        />
        <NumberDisplay 
          value={timeRemaining.hours} 
          previousValue={previousTime.hours}
          unit="h" 
        />
        <NumberDisplay 
          value={timeRemaining.minutes} 
          previousValue={previousTime.minutes}
          unit="m" 
        />
      </time>
      
      <motion.div 
        className={`w-1.5 h-1.5 rounded-full ml-2 ${colors.dot}`}
        variants={urgencyDotVariants}
        animate={urgencyLevel}
        aria-label={`Timeline status: ${colors.label}`}
      />
    </motion.div>
  )
}

export default CountdownTimer