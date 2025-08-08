/**
 * Transition utilities to help migrate from existing custom components to shadcn/ui
 * These utilities provide compatibility layers and common patterns during the migration
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Enhanced cn utility function that combines clsx and tailwind-merge
 * This is the standard shadcn/ui utility for className composition
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps existing Toast types to shadcn/ui compatible variants
 * Helps maintain existing toast functionality during transition
 */
export const toastVariantMap = {
  success: "default" as const,
  error: "destructive" as const,
  warning: "default" as const,
  info: "default" as const,
  loading: "default" as const,
}

/**
 * Maps existing button styles to shadcn/ui button variants
 * Preserves existing button styling patterns
 */
export const buttonVariantMap = {
  primary: "default" as const,
  secondary: "secondary" as const,
  outline: "outline" as const,
  ghost: "ghost" as const,
  danger: "destructive" as const,
  success: "default" as const,
  warning: "default" as const,
}

/**
 * Maps existing button sizes to shadcn/ui button sizes
 */
export const buttonSizeMap = {
  small: "sm" as const,
  medium: "default" as const,
  large: "lg" as const,
  xs: "sm" as const,
  sm: "sm" as const,
  md: "default" as const,
  lg: "lg" as const,
  xl: "lg" as const,
}

/**
 * Common glassmorphism classes used in Dico Platform
 * Maintains the existing visual style during migration
 */
export const glassmorphismClasses = {
  card: "backdrop-blur-md bg-white/10 border border-white/20",
  modal: "backdrop-blur-xl bg-white/5 border border-white/10",
  button: "backdrop-blur-sm bg-white/20 hover:bg-white/30",
  input: "backdrop-blur-sm bg-white/10 border border-white/20 focus:bg-white/20",
  header: "backdrop-blur-lg bg-white/5 border-b border-white/10",
}

/**
 * Gradient background classes for consistency
 */
export const gradientClasses = {
  primary: "bg-gradient-to-r from-blue-500 to-purple-600",
  secondary: "bg-gradient-to-r from-purple-500 to-pink-500",
  success: "bg-gradient-to-r from-green-500 to-emerald-500",
  warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
  danger: "bg-gradient-to-r from-red-500 to-pink-500",
  background: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
}

/**
 * Animation classes for micro-interactions
 */
export const animationClasses = {
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-200",
  slideIn: "animate-in slide-in-from-bottom duration-300",
  slideOut: "animate-out slide-out-to-bottom duration-200",
  scaleIn: "animate-in zoom-in duration-200",
  scaleOut: "animate-out zoom-out duration-150",
  shimmer: "animate-shimmer",
  pulse: "animate-pulse-slow",
}

/**
 * Typography classes for consistent text styling
 */
export const typographyClasses = {
  heading1: "text-4xl font-bold tracking-tight",
  heading2: "text-3xl font-semibold tracking-tight",
  heading3: "text-2xl font-semibold tracking-tight",
  heading4: "text-xl font-semibold tracking-tight",
  body: "text-base font-normal",
  caption: "text-sm text-muted-foreground",
  code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
}

/**
 * Utility to create component variant classes
 * Helps create consistent component APIs during migration
 */
export function createVariants<T extends Record<string, any>>(variants: T) {
  return (variant: keyof T) => variants[variant]
}

/**
 * Utility to merge component props with shadcn/ui patterns
 * Helps maintain existing component interfaces
 */
export function mergeComponentProps<T extends Record<string, any>>(
  defaultProps: T,
  userProps: Partial<T>
): T {
  return {
    ...defaultProps,
    ...userProps,
    className: cn(defaultProps.className, userProps.className),
  }
}

/**
 * Common loading state classes
 */
export const loadingClasses = {
  spinner: "animate-spin rounded-full border-2 border-current border-t-transparent",
  pulse: "animate-pulse bg-muted rounded",
  skeleton: "animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded",
}

/**
 * Responsive breakpoint utilities
 */
export const responsive = {
  mobile: "sm:",
  tablet: "md:",
  desktop: "lg:",
  wide: "xl:",
  ultrawide: "2xl:",
} as const

/**
 * Color palette based on shadcn/ui design tokens
 */
export const colorClasses = {
  primary: {
    50: "bg-primary/5 text-primary",
    100: "bg-primary/10 text-primary",
    500: "bg-primary text-primary-foreground",
    600: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  secondary: {
    50: "bg-secondary/50 text-secondary-foreground",
    100: "bg-secondary text-secondary-foreground",
    500: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  },
  muted: {
    50: "bg-muted/50 text-muted-foreground",
    100: "bg-muted text-muted-foreground",
  },
  destructive: {
    50: "bg-destructive/5 text-destructive",
    100: "bg-destructive/10 text-destructive",
    500: "bg-destructive text-destructive-foreground",
  },
}

/**
 * Layout utilities for consistent spacing and sizing
 */
export const layoutClasses = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-12 sm:py-16 lg:py-20",
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 sm:grid-cols-2",
    cols3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },
}

/**
 * Form validation state classes
 */
export const validationClasses = {
  success: "border-green-500 text-green-600 focus:border-green-500 focus:ring-green-500",
  error: "border-destructive text-destructive focus:border-destructive focus:ring-destructive",
  warning: "border-yellow-500 text-yellow-600 focus:border-yellow-500 focus:ring-yellow-500",
  default: "border-input focus:border-ring focus:ring-ring",
}

/**
 * Transition helper for migrating components gradually
 * Allows coexistence of old and new components
 */
export function createTransitionWrapper<T extends React.ComponentType<any>>(
  LegacyComponent: T,
  NewComponent: T,
  useShadcn: boolean = false
) {
  return useShadcn ? NewComponent : LegacyComponent
}

/**
 * Props mapping utilities for component migration
 */
export const propMappings = {
  // Maps old toast props to new sonner props
  toastProps: (oldProps: any) => ({
    title: oldProps.title,
    description: oldProps.message || oldProps.description,
    duration: oldProps.duration || 4000,
    action: oldProps.action,
  }),

  // Maps old button props to new shadcn button props
  buttonProps: (oldProps: any) => ({
    variant: buttonVariantMap[oldProps.variant as keyof typeof buttonVariantMap] || "default",
    size: buttonSizeMap[oldProps.size as keyof typeof buttonSizeMap] || "default",
    disabled: oldProps.disabled || oldProps.loading,
    className: cn(
      oldProps.loading && "opacity-50 cursor-not-allowed",
      oldProps.className
    ),
  }),

  // Maps old card props to new shadcn card props
  cardProps: (oldProps: any) => ({
    className: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      oldProps.glassmorphism && glassmorphismClasses.card,
      oldProps.className
    ),
  }),
}