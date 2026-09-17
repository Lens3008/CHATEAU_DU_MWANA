'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard logistician error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Erreur du Dashboard Logisticien"
        message={error.message || "Un problème est survenu lors du chargement du dashboard logisticien."}
        onRetry={reset}
        showRetry={true}
      />
    </div>
  )
}
