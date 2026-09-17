// @ts-nocheck
import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../prisma/db'
import Link from 'next/link'
import { ArrowLeft, Archive, Plus, ArrowRightLeft } from 'lucide-react'

export default async function InventoryPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  // Lots d'inventaire
  const inventory = await db.orm.public.Inventory
    .include('equipment', e => e.select('name'))
    .include('storageLocation', l => l.select('name'))
    .orderBy(i => i.status.asc())
    .all()

  // On regroupe un peu par statut pour afficher des badges sympas
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase">Disponible</span>
      case 'IN_USE': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase">En cours d'utilisation</span>
      case 'IN_MAINTENANCE': return <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold uppercase">En maintenance</span>
      case 'LOST': return <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded text-xs font-bold uppercase">Perdu</span>
      default: return <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <Link href="/admin/logistics" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour Logistique
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <Archive className="w-8 h-8 text-amber-600" />
              Inventaire & Lots
            </h1>
            <p className="text-stone-500 mt-1">Gérez les lots physiques, effectuez des ajustements et transferts de stock.</p>
          </div>
          <div className="flex gap-2">
             <button className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" /> Transférer
             </button>
             <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
               <Plus className="w-4 h-4" /> Entrée / Sortie
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-stone-900">Lots (Inventory)</h3>
        </div>
        
        <div className="divide-y divide-stone-100">
          {inventory.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucun stock enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3">Équipement</th>
                    <th className="px-6 py-3">Emplacement</th>
                    <th className="px-6 py-3 text-right">Quantité</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {inventory.map(lot => (
                    <tr key={lot.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-900">{lot.equipment?.name || 'Inconnu'}</p>
                        {lot.name && <p className="text-xs text-stone-500">Réf: {lot.name}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-stone-600">
                          {lot.storageLocation?.name || 'Non défini'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-stone-900 text-lg">{lot.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lot.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-amber-600 font-medium hover:text-amber-700">Ajuster</button>
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
  )
}
