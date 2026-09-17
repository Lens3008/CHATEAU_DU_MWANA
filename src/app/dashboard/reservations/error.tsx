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
    console.error('Reservations error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Erreur des Réservations"
        message={error.message || "Un problème est survenu lors du chargement de vos réservations."}
        onRetry={reset}
        showRetry={true}
      />
    </div>
  )
}
