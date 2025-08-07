'use client'

import { useEffect, useState } from 'react'

interface SSRWrapperProps {
  children: React.ReactNode
}

export function SSRWrapper({ children }: SSRWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Return a loading state or minimal UI for SSR
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}