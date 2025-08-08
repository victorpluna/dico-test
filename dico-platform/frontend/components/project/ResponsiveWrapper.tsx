'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

// Hook for responsive behavior using Tailwind/shadcn-ui breakpoints
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
    handleResize() // Call once to set initial size
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Tailwind/shadcn-ui breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
  const isMobile = windowSize.width < 640
  const isSm = windowSize.width >= 640 && windowSize.width < 768
  const isMd = windowSize.width >= 768 && windowSize.width < 1024
  const isLg = windowSize.width >= 1024 && windowSize.width < 1280
  const isXl = windowSize.width >= 1280 && windowSize.width < 1536
  const is2Xl = windowSize.width >= 1536

  const isTablet = isSm || isMd
  const isDesktop = isLg || isXl || is2Xl

  return {
    windowSize,
    isMobile,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isTablet,
    isDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    currentBreakpoint: isMobile ? 'mobile' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : isXl ? 'xl' : '2xl'
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

// Enhanced responsive component wrapper with shadcn-ui breakpoints
interface ResponsiveWrapperProps {
  children: React.ReactNode
  mobileClass?: string
  smClass?: string
  mdClass?: string
  lgClass?: string
  xlClass?: string
  xl2Class?: string
  tabletClass?: string // Legacy support
  desktopClass?: string // Legacy support
  className?: string
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobileClass = '',
  smClass = '',
  mdClass = '',
  lgClass = '',
  xlClass = '',
  xl2Class = '',
  tabletClass = '', // Fallback for legacy
  desktopClass = '', // Fallback for legacy
  className = ''
}) => {
  const { 
    isMobile, 
    isSm, 
    isMd, 
    isLg, 
    isXl, 
    is2Xl,
    isTablet, 
    isDesktop 
  } = useResponsive()

  // Use specific breakpoint classes if provided, otherwise fall back to legacy classes
  const responsiveClass = isMobile 
    ? mobileClass 
    : isSm && smClass 
      ? smClass 
      : isMd && mdClass 
        ? mdClass 
        : isLg && lgClass 
          ? lgClass 
          : isXl && xlClass 
            ? xlClass 
            : is2Xl && xl2Class 
              ? xl2Class 
              : isTablet 
                ? tabletClass 
                : desktopClass

  return (
    <div className={`${className} ${responsiveClass}`.trim()}>
      {children}
    </div>
  )
}

// Re-export Button from shadcn-ui for legacy compatibility
export { Button as AccessibleButton } from '@/components/ui/button'

// Enhanced accessible input component using shadcn-ui Input

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

  return (
    <div className="space-y-1">
      {showLabel && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <Input
        id={inputId}
        className={error ? 'border-destructive focus-visible:ring-destructive/20' : className}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
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
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-ring focus:ring-offset-2"
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