// @ts-nocheck
import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../../../prisma/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Box, CheckCircle2, PackageSearch } from 'lucide-react'

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'SUPERVISOR'])

  const serviceId = params.id
  
  // Fetch service with its category and formulas (and resources within formulas)
  const service = await db.orm.public.Service
    .where({ id: serviceId })
    .include('category', c => c.select('name'))
    .include('formulas', f => f.include('resources', r => r.include('equipment', e => e.select('name', 'totalGlobalQuantity'))))
    .first()

  if (!service) {
    notFound()
  }
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <Link href="/admin/catalogue" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {service.category?.name || 'Général'}
              </span>
              {service.availability ? (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Disponible
                </span>
              ) : (
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Indisponible
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{service.name}</h1>
            <p className="text-stone-500 mt-2 max-w-2xl">{service.description || 'Aucune description fournie.'}</p>
          </div>
          <div className="text-right bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
            <p className="text-sm text-stone-400 font-medium">Prix de base</p>
            <p className="text-2xl font-bold text-stone-900">{Number(service.basePrice)} FCFA</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-stone-900">Formules associées</h3>
          <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
            + Ajouter une formule
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {service.formulas.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Box className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Aucune formule définie pour cette prestation.</p>
            </div>
          ) : (
            service.formulas.map(formula => (
              <div key={formula.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                      {formula.name}
                      {!formula.availability && <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">Inactif</span>}
                    </h4>
                    <p className="text-sm text-stone-500 mt-1">{formula.description}</p>
                  </div>
                  <p className="font-bold text-stone-900">{Number(formula.price)} FCFA</p>
                </div>

                {/* Ressources Requises pour la formule */}
                <div className="bg-stone-50 rounded-xl p-4 mt-4">
                  <h5 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                    <PackageSearch className="w-4 h-4 text-stone-400" />
                    Ressources Matérielles Requises
                  </h5>
                  
                  {formula.resources.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">Aucun équipement spécifique n'est requis pour cette formule.</p>
                  ) : (
                    <ul className="space-y-2">
                      {formula.resources.map(res => (
                        <li key={res.id} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded border border-stone-100">
                          <span className="font-medium text-stone-700">{res.equipment?.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-stone-500 text-xs">Stock Global: {res.equipment?.totalGlobalQuantity || 0}</span>
                            <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-xs">
                              Requis: {res.requiredQuantity}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 text-right">
                     <button className="text-xs font-medium text-amber-600 hover:text-amber-700">Gérer les ressources</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
