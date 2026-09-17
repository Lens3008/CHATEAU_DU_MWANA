import { requireRole } from '@/lib/auth/user'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Nouvelle Réservation | Château du Mwana Admin',
}

export default async function NewReservationPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY'])

  // Fetch data needed for the form
  const customers = await db.orm.public.Customer.all()
  const categories = await db.orm.public.ServiceCategory.all()
  const services = await db.orm.public.Service.all()
  const formulas = await db.orm.public.Formula.all()
  const locations = await db.orm.public.Location.all()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/reservations"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux réservations
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle Réservation</h1>
        <p className="text-slate-500 mt-1">Créer une nouvelle réservation pour un client</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">
            Le formulaire de création de réservation sera implémenté dans une phase ultérieure.
          </p>
          <p className="text-sm text-slate-400">
            Pour l'instant, les réservations sont créées via le formulaire public sur le site.
          </p>
          <Link
            href="/reserver"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Accéder au formulaire public
          </Link>
        </div>
      </div>

      {/* Data availability summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500">Clients disponibles</p>
          <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500">Formules disponibles</p>
          <p className="text-2xl font-bold text-slate-900">{formulas.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500">Lieux disponibles</p>
          <p className="text-2xl font-bold text-slate-900">{locations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500">Catégories</p>
          <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
        </div>
      </div>
    </div>
  )
}