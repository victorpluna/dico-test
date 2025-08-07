'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, uiSelectors } from '@/lib/store/uiStore'

export function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const toasts = useUIStore(uiSelectors.visibleToasts)
  const { removeToast } = useUIStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message?: string
    duration?: number
    createdAt: Date
  }
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, title, message, duration = 5000 } = toast

  // Auto-close after duration
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          message: 'text-yellow-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700'
        }
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700'
        }
    }
  }

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const styles = getToastStyles()

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        max-w-sm w-full rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${styles.bg}
      `}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getToastIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.title}`}>
            {title}
          </p>
          {message && (
            <p className={`mt-1 text-sm ${styles.message}`}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-50 focus:ring-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-600 rounded-md`}
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ToastContainer