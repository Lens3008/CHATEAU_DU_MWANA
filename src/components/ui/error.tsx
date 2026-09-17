import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorState({ 
  title = "Une erreur s'est produite",
  message = "Un problème inattendu est survenu. Veuillez réessayer.",
  onRetry,
  showRetry = true
}: { 
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        )}
      </div>
    </div>
  )
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

export function FormError({ errors }: { errors: Record<string, string> }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="font-semibold text-red-900 mb-2">Veuillez corriger les erreurs suivantes :</h4>
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field} className="text-sm text-red-700">
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}
