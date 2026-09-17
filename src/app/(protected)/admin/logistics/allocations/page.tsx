// @ts-nocheck
import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../prisma/db'
import Link from 'next/link'
import { ArrowLeft, PackageSearch, CalendarDays } from 'lucide-react'

export default async function AllocationsPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  // On affiche les allocations futures (Phase 11 preview)
  const allocations = await db.orm.public.InventoryAllocation
    .include('inventory', i => i.include('equipment', e => e.select('name')))
    .include('reservation', r => r.select('reference', 'startDate', 'endDate'))
    .orderBy(a => a.startDate.asc())
    .limit(50)
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
              <PackageSearch className="w-8 h-8 text-amber-600" />
              Allocations & Réservations
            </h1>
            <p className="text-stone-500 mt-1">Consultez les équipements bloqués pour les événements à venir (Préparation Phase 11).</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-stone-900">Équipements alloués</h3>
        </div>
        
        <div className="divide-y divide-stone-100">
          {allocations.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune allocation future enregistrée.</p>
              <p className="text-sm mt-2">Le moteur de réservation (Phase 11) peuplera cette vue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3">Équipement (Lot)</th>
                    <th className="px-6 py-3">Réservation</th>
                    <th className="px-6 py-3">Période</th>
                    <th className="px-6 py-3 text-right">Quantité allouée</th>
                    <th className="px-6 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {allocations.map(alloc => (
                    <tr key={alloc.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-900">{alloc.inventory?.equipment?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded text-stone-600">
                          {alloc.reservation?.reference || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {alloc.startDate.toLocaleDateString('fr-FR')} - {alloc.endDate.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-stone-900">{alloc.quantityAllocated}</span>
                      </td>
                      <td className="px-6 py-4">
                        {alloc.status === 'RESERVED' ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase">Réservé</span>
                        ) : alloc.status === 'DEPLOYED' ? (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold uppercase">Déployé</span>
                        ) : (
                          <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded text-xs font-bold uppercase">{alloc.status}</span>
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
  )
}
