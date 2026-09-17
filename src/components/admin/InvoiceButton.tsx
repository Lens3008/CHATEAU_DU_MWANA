'use client'

import { useState } from 'react'
import { generateInvoiceAction } from '@/lib/actions/invoice-actions'

export default function InvoiceButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setMessage(null)
    const result = await generateInvoiceAction(reservationId)
    setLoading(false)
    if (!result.success) {
      setMessage(result.error || 'Facture impossible.')
      return
    }
    setMessage(`Facture ${result.data.number} générée.`)
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleClick} disabled={loading} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Génération...' : 'Générer la facture'}
      </button>
      {message && <span role="status" aria-live="polite" className="text-xs text-slate-600">{message}</span>}
    </div>
  )
}
