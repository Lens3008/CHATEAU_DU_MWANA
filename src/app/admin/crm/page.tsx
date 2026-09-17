import { requireAuth, requireRole } from '@/lib/auth/user';
import { getCRMDashboardStatsAction, getCustomersAction } from '@/lib/actions/crm-actions';
import Link from 'next/link';

export const metadata = {
  title: 'CRM & Clients | Le Château du Mwana',
};

export default async function CRMPage() {
  // Security: LOGISTICIAN should not have access to global CRM data
  // Only ADMIN, SUPERVISOR, and SECRETARY can access CRM
  const user = await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);

  const stats = await getCRMDashboardStatsAction();
  const customers = await getCustomersAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">CRM & Clients</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Total Clients</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Clients Actifs</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.activeCustomersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Clients Récurrents</h3>
          <p className="text-3xl font-bold text-emerald-600">{stats.recurringCustomersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Panier Moyen</h3>
          <p className="text-3xl font-bold text-slate-800">{Math.round(stats.averageCart).toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Base Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium border-b border-slate-100">Client</th>
                <th className="p-4 font-medium border-b border-slate-100">Contact</th>
                <th className="p-4 font-medium border-b border-slate-100">Réservations</th>
                <th className="p-4 font-medium border-b border-slate-100">CA Total</th>
                <th className="p-4 font-medium border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{c.firstName} {c.lastName}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{c.email}</div>
                      <div className="text-sm">{c.phone}</div>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">
                      {c.reservationsCount}
                    </td>
                    <td className="p-4 text-slate-800 font-medium">
                      {c.totalSpent.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/admin/crm/clients/${c.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Fiche 360°
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
