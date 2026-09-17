import { requireRole } from '@/lib/auth/user'
import Link from 'next/link'
import { PackageSearch, Archive, MapPin, Wrench as Tool, ArrowRight, Settings2 } from 'lucide-react'
import { db } from '../../../../prisma/db'

export default async function LogisticsDashboardPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  // Fetch some summary data for KPIs
  const equipmentCount = await db.orm.public.Equipment.aggregate((a: any) => ({ total: a.count() }))
  const maintenanceCount = await db.orm.public.EquipmentMaintenance.where({ status: 'IN_PROGRESS' }).aggregate((a: any) => ({ total: a.count() }))
  const locationsCount = await db.orm.public.StorageLocation.aggregate((a: any) => ({ total: a.count() }))

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
          <PackageSearch className="w-8 h-8 text-amber-600" />
          Logistique & Inventaire
        </h1>
        <p className="text-stone-500 mt-1">Gérez vos équipements, vos stocks et vos maintenances.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-600">
                <Settings2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{equipmentCount.total as number}</span>
            </div>
            <h3 className="font-semibold text-stone-900">Catalogue Équipements</h3>
            <p className="text-sm text-stone-500 mt-1">Références de matériels enregistrées dans le système.</p>
          </div>
          <Link href="/admin/logistics/equipments" className="mt-6 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Gérer les références <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Archive className="w-6 h-6" />
              </div>
            </div>
            <h3 className="font-semibold text-stone-900">Stock & Inventaire (Lots)</h3>
            <p className="text-sm text-stone-500 mt-1">Supervision temps réel des quantités, mouvements et transferts.</p>
          </div>
          <Link href="/admin/logistics/inventory" className="mt-6 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Voir les stocks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <Tool className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{maintenanceCount.total as number}</span>
            </div>
            <h3 className="font-semibold text-stone-900">Maintenances en cours</h3>
            <p className="text-sm text-stone-500 mt-1">Lots actuellement indisponibles pour cause de réparation.</p>
          </div>
          <Link href="/admin/logistics/maintenance" className="mt-6 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Suivi maintenance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Emplacements de stockage</h3>
              <p className="text-sm text-stone-500">{locationsCount.total as number} emplacement(s) enregistré(s)</p>
            </div>
          </div>
          <Link href="/admin/logistics/locations" className="text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 px-4 py-2 rounded-lg transition-colors">
            Gérer
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-600">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Allocations (Réservations)</h3>
              <p className="text-sm text-stone-500">Matériel bloqué pour les événements</p>
            </div>
          </div>
          <Link href="/admin/logistics/allocations" className="text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 px-4 py-2 rounded-lg transition-colors">
            Consulter
          </Link>
        </div>
      </div>
    </div>
  )
}
