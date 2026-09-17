import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../prisma/db'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Warehouse } from 'lucide-react'

export default async function LocationsPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  const storageLocations = await db.orm.public.StorageLocation.orderBy(l => l.name.asc()).all()
  const physicalLocations = await db.orm.public.Location.orderBy(l => l.name.asc()).limit(50).all()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <Link href="/admin/logistics" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour Logistique
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-8 h-8 text-amber-600" />
              Lieux et Stockages
            </h1>
            <p className="text-stone-500 mt-1">Gérez les emplacements de stockage et le répertoire des lieux.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Storage Locations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-amber-600" />
              Lieux de Stockage (Magasins)
            </h3>
            <button className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-100">
            {storageLocations.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Warehouse className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucun magasin de stockage configuré.</p>
              </div>
            ) : (
              storageLocations.map(s => (
                <div key={s.id} className="p-4 hover:bg-stone-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-stone-900">{s.name}</p>
                    {s.description && <p className="text-sm text-stone-500">{s.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Physical Locations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Répertoire des Lieux physiques
            </h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-100">
            {physicalLocations.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <MapPin className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucun lieu enregistré.</p>
              </div>
            ) : (
              physicalLocations.map(l => (
                <div key={l.id} className="p-4 hover:bg-stone-50 transition-colors flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {l.isChateau && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                          Interne
                        </span>
                      )}
                      <p className="font-semibold text-stone-900">{l.name || 'Sans nom'}</p>
                    </div>
                    <p className="text-sm text-stone-500">{l.city ? `${l.city}, ${l.country}` : 'Adresse non précisée'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
