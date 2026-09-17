// @ts-nocheck
import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../prisma/db'
import Link from 'next/link'
import { ArrowLeft, Wrench as Tool, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function MaintenancePage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'LOGISTICIAN'])

  const maintenanceTasks = await db.orm.public.EquipmentMaintenance
    .include('inventory', i => i.include('equipment', e => e.select('name')))
    .include('user', u => u.select('name', 'email'))
    .orderBy(m => m.startDate.desc())
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
              <Tool className="w-8 h-8 text-rose-600" />
              Suivi de Maintenance
            </h1>
            <p className="text-stone-500 mt-1">Historique et gestion des équipements endommagés ou en réparation.</p>
          </div>
          <button className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Déclarer une panne
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-stone-900">Interventions de maintenance</h3>
        </div>
        
        <div className="divide-y divide-stone-100">
          {maintenanceTasks.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Tool className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune maintenance enregistrée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3">Équipement (Lot)</th>
                    <th className="px-6 py-3">Problème signalé</th>
                    <th className="px-6 py-3">Responsable</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {maintenanceTasks.map(task => (
                    <tr key={task.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-900">{task.inventory?.equipment?.name || 'Stock Inconnu'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-stone-600 line-clamp-2">{task.issueDescription}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-stone-600">
                          {task.responsible?.name || task.responsible?.email?.split('@')[0] || 'Non assigné'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {task.startDate.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        {task.status === 'RESOLVED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Résolu
                          </span>
                        ) : task.status === 'IN_PROGRESS' ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase">En cours</span>
                        ) : (
                          <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded text-xs font-bold uppercase">{task.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {task.status !== 'RESOLVED' && (
                          <button className="text-amber-600 font-medium hover:text-amber-700">Clôturer</button>
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
