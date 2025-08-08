'use client'

import { toast } from 'sonner'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
}

export const showToast = {
  success: (options: ToastOptions) => {
    const { title, message, duration = 4000 } = options
    toast.success(title, {
      description: message,
      duration,
      icon: <CheckCircle className="w-4 h-4" />,
      className: 'toast-success',
      style: {
        backgroundColor: 'rgb(240, 253, 244)',
        borderColor: 'rgb(34, 197, 94)',
        color: 'rgb(22, 101, 52)',
      }
    })
  },
  
  error: (options: ToastOptions) => {
    const { title, message, duration = 5000 } = options
    toast.error(title, {
      description: message,
      duration,
      icon: <XCircle className="w-4 h-4" />,
      className: 'toast-error',
      style: {
        backgroundColor: 'rgb(254, 242, 242)',
        borderColor: 'rgb(239, 68, 68)',
        color: 'rgb(153, 27, 27)',
      }
    })
  },
  
  warning: (options: ToastOptions) => {
    const { title, message, duration = 4000 } = options
    toast.warning(title, {
      description: message,
      duration,
      icon: <AlertTriangle className="w-4 h-4" />,
      className: 'toast-warning',
      style: {
        backgroundColor: 'rgb(255, 251, 235)',
        borderColor: 'rgb(245, 158, 11)',
        color: 'rgb(146, 64, 14)',
      }
    })
  },
  
  info: (options: ToastOptions) => {
    const { title, message, duration = 4000 } = options
    toast.info(title, {
      description: message,
      duration,
      icon: <Info className="w-4 h-4" />,
      className: 'toast-info',
      style: {
        backgroundColor: 'rgb(239, 246, 255)',
        borderColor: 'rgb(59, 130, 246)',
        color: 'rgb(30, 58, 138)',
      }
    })
  },

  custom: (options: ToastOptions & { 
    type: 'success' | 'error' | 'warning' | 'info'
  }) => {
    const { type, ...rest } = options
    showToast[type](rest)
  }
}

export { Toaster } from './sonner'

export default showToast