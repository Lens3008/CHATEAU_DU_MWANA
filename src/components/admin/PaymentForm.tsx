'use client'

import { useState } from 'react'
import { addPaymentAction } from '@/lib/actions/payment-actions'

type PaymentFormProps = {
  reservationId: string
  remaining: number
  onCompleted?: () => void
}

const methods = [
  ['CASH', 'Espèces'],
  ['CARD', 'Carte'],
  ['MOBILE_MONEY', 'Mobile Money'],
  ['BANK_TRANSFER', 'Virement bancaire'],
  ['CHEQUE', 'Chèque'],
] as const

export default function PaymentForm({ reservationId, remaining, onCompleted }: PaymentFormProps) {
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : '')
  const [method, setMethod] = useState('CASH')
  const [operator, setOperator] = useState('Airtel Money')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage({ type: 'error', text: 'Le montant doit être supérieur à 0.' })
      return
    }
    if (numericAmount > remaining) {
      setMessage({ type: 'error', text: 'Le montant dépasse le solde restant.' })
      return
    }

    setLoading(true)
    const result = await addPaymentAction({
      reservationId,
      amount: numericAmount,
      method,
      reference: reference || (method === 'MOBILE_MONEY' ? operator : undefined),
    })
    setLoading(false)

    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Paiement impossible.' })
      return
    }

    setMessage({ type: 'success', text: `Paiement de ${numericAmount.toLocaleString('fr-FR')} FCFA enregistré.` })
    onCompleted?.()
  }

  return (
    <div className="mt-4">
      {!open && (
        <button type="button" onClick={() => setOpen(true)} disabled={remaining <= 0} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          Encaisser
        </button>
      )}
      {open && <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="payment-amount" className="mb-1 block text-sm font-medium">Montant</label>
          <input
            id="payment-amount"
            type="number"
            min="0.01"
            max={remaining}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="payment-method" className="mb-1 block text-sm font-medium">Méthode</label>
          <select
            id="payment-method"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            {methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {method === 'MOBILE_MONEY' && (
        <div>
          <label htmlFor="payment-operator" className="mb-1 block text-sm font-medium">Opérateur</label>
          <select
            id="payment-operator"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option>Airtel Money</option>
            <option>Moov Money</option>
            <option>Autre</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="payment-reference" className="mb-1 block text-sm font-medium">Référence (facultatif)</label>
        <input
          id="payment-reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          maxLength={120}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
          placeholder="Référence du reçu ou de la transaction"
        />
      </div>

      {message && (
        <p role="status" aria-live="polite" className={message.type === 'error' ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>
          {message.text}
        </p>
      )}

        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} disabled={loading} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50">
            Annuler
          </button>
          <button type="submit" disabled={loading || remaining <= 0} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </button>
        </div>
      </form>}
    </div>
  )
}
