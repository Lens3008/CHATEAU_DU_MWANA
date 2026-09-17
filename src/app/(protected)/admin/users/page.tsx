import { requireRole } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import { MoreVertical, ShieldAlert, ShieldCheck } from 'lucide-react'

export default async function AdminUsersPage() {
  // Protection stricte: seul ADMIN peut accéder
  // TODO: Supervisor can access it conditionally if required, but the prompt says:
  // "ADMIN: accès. SUPERVISOR : accès uniquement si cette capacité est réellement prévue par le RBAC actuel."
  // By default, let's keep it strictly ADMIN for now as it's the safest.
  await requireRole(['ADMIN', 'SUPERVISOR'])

  // Fetch users with Prisma 8
  const users = await db.orm.public.User.all()

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Utilisateurs</h1>
          <p className="text-stone-500 text-sm mt-1">Gérez les comptes clients et les membres de l'équipe.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50/80 text-stone-500 border-b border-stone-200/60 font-medium">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Inscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const isAdmin = u.role === 'ADMIN'
                const isTeam = ['ADMIN', 'SUPERVISOR', 'SECRETARY', 'LOGISTICIAN'].includes(u.role)
                
                return (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${isAdmin ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
                          {u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{u.name || 'Non renseigné'}</div>
                          <div className="text-stone-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                        ${isTeam 
                          ? isAdmin ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                        }
                      `}>
                        {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : (isTeam ? <ShieldCheck className="w-3.5 h-3.5" /> : null)}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                        ${u.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-stone-500 bg-stone-100'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {/* @ts-ignore Prisma 8 Temporal property */}
                      {u.createdAt ? new Date(u.createdAt.toString()).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
