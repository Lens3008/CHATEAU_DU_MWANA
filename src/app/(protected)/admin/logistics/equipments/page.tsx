// @ts-nocheck
import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../prisma/db'
import Link from 'next/link'
import { ArrowLeft, Plus, Settings2, FolderTree } from 'lucide-react'

export default async function EquipmentsPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  const categories = await db.orm.public.EquipmentCategory.orderBy(c => c.name.asc()).all()
  const equipments = await db.orm.public.Equipment
    .include('category', c => c.select('name'))
    .orderBy(e => e.name.asc())
    .all()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <Link href="/admin/logistics" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour Logistique
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <Settings2 className="w-8 h-8 text-amber-600" />
              Catalogue des Équipements
            </h1>
            <p className="text-stone-500 mt-1">Gérez les références du matériel (sans la gestion des lots de stock).</p>
          </div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel équipement
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Catégories (Sidebar) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-stone-400" />
              Familles
            </h3>
            {categories.length === 0 ? (
              <p className="text-sm text-stone-400 italic">Aucune famille.</p>
            ) : (
              <ul className="space-y-2">
                {categories.map(c => (
                  <li key={c.id} className="flex justify-between items-center text-sm py-2 border-b border-stone-50 last:border-0">
                    <span className="text-stone-600 font-medium">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <button className="mt-4 text-amber-600 text-sm font-medium hover:text-amber-700 w-full text-left flex items-center gap-1">
              <Plus className="w-3 h-3" /> Ajouter une famille
            </button>
          </div>
        </div>

        {/* Liste équipements */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="font-semibold text-stone-900">Toutes les références</h3>
            </div>
            
            <div className="divide-y divide-stone-100">
              {equipments.length === 0 ? (
                <div className="p-12 text-center text-stone-400">
                  <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun équipement de référence.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                      <tr>
                        <th className="px-6 py-3">Équipement</th>
                        <th className="px-6 py-3">Famille</th>
                        <th className="px-6 py-3">Stock Théorique Global</th>
                        <th className="px-6 py-3 text-right">Seuil d'alerte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {equipments.map(e => (
                        <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-stone-900">{e.name}</p>
                            <p className="text-xs text-stone-500">{e.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-800">
                              {e.category?.name || 'Non classé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-stone-900">
                            {e.totalGlobalQuantity}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {e.minStockThreshold > 0 ? (
                              <span className="text-rose-600 font-medium">{e.minStockThreshold}</span>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
