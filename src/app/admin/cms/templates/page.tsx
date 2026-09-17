import { requireAuth, requireRole } from '@/lib/auth/user';
import { getTemplates } from '@/lib/services/templates';
import Link from 'next/link';

export const metadata = { title: 'Templates | CMS | Le Château du Mwana' };

export default async function TemplatesPage() {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Modèles de documents</h1>
          <p className="text-slate-500 mt-1">Gérez vos templates (Factures, Devis, Contrats)</p>
        </div>
        <Link href="/admin/cms/templates/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          Nouveau modèle
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mis à jour le</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((tpl: any) => (
              <tr key={tpl.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tpl.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tpl.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactif</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tpl.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/cms/templates/${tpl.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
