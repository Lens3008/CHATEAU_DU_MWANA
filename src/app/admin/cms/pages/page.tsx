// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getPagesAction } from '@/lib/actions/cms-actions';
import Link from 'next/link';

export const metadata = {
  title: 'Pages | CMS | Le Château du Mwana',
};

export default async function PagesPage() {
  const user = await requireRole(['ADMIN']);

  const pages = await getPagesAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pages</h1>
          <p className="text-slate-500 mt-1">Gérez le contenu des pages publiques du site</p>
        </div>
        <Link 
          href="/admin/cms/pages/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          Nouvelle page
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">Titre</th>
              <th className="p-4 font-semibold text-slate-600">URL / Slug</th>
              <th className="p-4 font-semibold text-slate-600">Statut</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Aucune page créée pour le moment.
                </td>
              </tr>
            ) : (
              pages.map((page: any) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{page.title}</p>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-sm">/{page.slug}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {page.isPublished ? 'Publiée' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/cms/pages/${page.id}`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                    >
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
