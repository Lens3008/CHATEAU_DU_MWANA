import { requireRole } from '@/lib/auth/user'
import { db } from '../../../../prisma/db'
import Link from 'next/link'
import { Building, Plus, ArrowRight } from 'lucide-react'

export default async function CataloguePage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY'])

  // Fetch categories and services
  const categories = await db.orm.public.ServiceCategory.all()
  const services = await db.orm.public.Service.all()
  const serviceCategories = await db.orm.public.ServiceCategory.all()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Building className="w-8 h-8 text-amber-600" />
            Catalogue des Prestations
          </h1>
          <p className="text-stone-500 mt-1">Gérez vos lieux, services et formules.</p>
        </div>
        <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle prestation
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Résumé des catégories (Sidebar) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-4">Catégories</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-stone-400 italic">Aucune catégorie existante.</p>
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
              <Plus className="w-3 h-3" /> Ajouter une catégorie
            </button>
          </div>
        </div>

        {/* Liste des prestations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <h3 className="font-semibold text-stone-900">Toutes les prestations</h3>
            </div>
            
            <div className="divide-y divide-stone-100">
              {services.length === 0 ? (
                <div className="p-12 text-center text-stone-400">
                  <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucune prestation enregistrée.</p>
                </div>
              ) : (
                services.map(s => {
                  const category = serviceCategories.find((c: any) => c.id === s.categoryId)
                  return (
                    <div key={s.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {category?.name || 'Général'}
                          </span>
                          {!s.availability && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Indisponible
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-stone-900">{s.name}</h4>
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2 max-w-lg">
                          {s.description || 'Aucune description.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p className="text-xs text-stone-400">À partir de</p>
                          <p className="font-bold text-stone-900">{Number(s.basePrice)} FCFA</p>
                        </div>
                        <Link 
                          href={`/admin/catalogue/services/${s.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}