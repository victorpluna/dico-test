'use client'

import { useEffect, useState } from 'react'

// Hook for responsive behavior
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}

// Accessibility hook for reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Screen reader utilities
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.style.position = 'absolute'
  announcement.style.left = '-10000px'
  announcement.style.width = '1px'
  announcement.style.height = '1px'
  announcement.style.overflow = 'hidden'
  
  document.body.appendChild(announcement)
  announcement.textContent = message
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstElement.focus()

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

// Responsive component wrapper
interface ResponsiveWrapperProps {
  children: React.ReactNode
  mobileClass?: string
  tabletClass?: string
  desktopClass?: string
  className?: string
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobileClass = '',
  tabletClass = '',
  desktopClass = '',
  className = ''
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const responsiveClass = isMobile ? mobileClass : isTablet ? tabletClass : desktopClass

  return (
    <div className={`${className} ${responsiveClass}`.trim()}>
      {children}
    </div>
  )
}

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  ariaLabel?: string
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  ariaLabel,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-600',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-blue-600',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-600',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }
  
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current'

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim()}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// Accessible input component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
  required?: boolean
  showLabel?: boolean
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helpText,
  required = false,
  showLabel = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`

  const inputClasses = `w-full px-3 py-2 border rounded-lg placeholder-gray-400 text-gray-900 focus:ring-2 focus:border-transparent transition-colors duration-200 ${
    error 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-600'
  }`

  return (
    <div className="space-y-1">
      {showLabel && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`${inputClasses} ${className}`.trim()}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Skip link component for keyboard navigation
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
  >
    {children}
  </a>
)

// High contrast mode detection
export const useHighContrast = () => {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(mediaQuery.matches)

    const handleChange = () => {
      setHighContrast(mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return highContrast
}

// Live region component for dynamic content announcements
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  politeness = 'polite',
  atomic = true 
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    className="sr-only"
  >
    {children}
  </div>
)

// Progress indicator for screen readers
interface ProgressAnnouncementProps {
  current: number
  total: number
  label: string
}

export const ProgressAnnouncement: React.FC<ProgressAnnouncementProps> = ({
  current,
  total,
  label
}) => (
  <LiveRegion>
    {label}: {current} of {total} ({Math.round((current / total) * 100)}% complete)
  </LiveRegion>
)

export default ResponsiveWrapper