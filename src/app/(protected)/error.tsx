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
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Une erreur est survenue"
        message={error.message || "Un problème inattendu s'est produit lors du chargement de cette page."}
        onRetry={reset}
        showRetry={true}
      />
    </div>
  )
}
