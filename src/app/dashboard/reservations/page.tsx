import { getCurrentUser } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Calendar, Clock, CreditCard, Eye } from 'lucide-react'
import Link from 'next/link'
import { EmptyReservations } from '@/components/ui/empty'

export const metadata = {
  title: 'Mes Réservations | Château du Mwana',
  description: 'Historique de vos réservations',
}

export default async function ClientReservationsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // CLIENT can only see their own reservations
  if (user.role !== 'CLIENT') {
    redirect('/admin/reservations')
  }

  // Fetch user's customer ID and their reservations
  const customerId = user.customerId
  if (!customerId) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-slate-500">Profil client non configuré. Veuillez contacter l'administration.</p>
        </div>
      </div>
    )
  }

  const customerReservations = await db.orm.public.Reservation.where({ customerId }).all()
  const customerArray = await db.orm.public.Customer.where({ id: customerId }).all()
  const customer = customerArray[0]
  const allFormulas = await db.orm.public.Formula.all()
  // Optimization: Fetch items only for these reservations if possible, 
  // but to keep it simple and safe for Prisma Next, we fetch all and filter in JS
  const allItems = await db.orm.public.ReservationItem.all()

  // Enhance with customer and formula data
  const reservations = customerReservations.map((r: any) => {
    const item = allItems.find((i: any) => i.reservationId === r.id)
    const formula = item ? allFormulas.find((f: any) => f.id === item.formulaId) : null
    
    return {
      ...r,
      customer,
      formula
    }
  })

  // Sort by date desc
  reservations.sort((a: any, b: any) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt.epochMilliseconds || a.createdAt)
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt.epochMilliseconds || b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mes Réservations</h1>
        <p className="text-slate-500 mt-1">Historique de vos réservations au Château du Mwana</p>
      </div>

      <div className="rounded-md border bg-white text-slate-900 shadow-sm">
        <div className="relative w-full overflow-auto mobile-table-scroll">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-slate-50">
                <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Référence</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Prestation</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Date prévue</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Montant</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Statut</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyReservations role="CLIENT" />
                  </td>
                </tr>
              ) : (
                reservations.map((res: any) => {
                  const sDate = res.startDate instanceof Date ? res.startDate : new Date(res.startDate.epochMilliseconds || res.startDate)
                  const formattedDate = sDate.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })

                  return (
                    <tr key={res.id} className="border-b transition-colors hover:bg-slate-50">
                      <td className="p-4 align-middle font-medium">
                        {res.reference}
                      </td>
                      <td className="p-4 align-middle">
                        {res.formula ? res.formula.name : 'Sur mesure'}
                        {res.participants && (
                          <span className="text-xs text-slate-500 ml-2">
                            {res.participants} pers.
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center text-slate-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-mono text-sm">
                          {Number(res.totalAmount).toLocaleString('fr-FR')} FCFA
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          res.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {res.status === 'CONFIRMED' ? 'Confirmée' :
                           res.status === 'COMPLETED' ? 'Terminée' :
                           res.status === 'CANCELLED' ? 'Annulée' :
                           res.status === 'DRAFT' ? 'Brouillon' : res.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link
                          href={`/admin/reservations/${res.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}