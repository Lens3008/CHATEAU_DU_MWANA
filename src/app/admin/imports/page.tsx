import { requireAuth, requireRole } from '@/lib/auth/user';
import { getImportJobs } from '@/lib/services/imports';
import { submitImportAction } from '@/lib/actions/imports-actions';
import Link from 'next/link';

export const metadata = { title: 'Imports | Admin | Le Château du Mwana' };

export default async function ImportsPage() {
  const user = await requireAuth();
  await requireRole(['ADMIN', 'SUPERVISOR']);

  const jobs = await getImportJobs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Imports de données</h1>
          <p className="text-slate-500 mt-1">Gérez l'importation de fichiers CSV (Clients, Équipements...)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Nouvel import CSV</h2>
        <form action={async (formData: FormData) => {
          'use server'
          await submitImportAction(formData);
        }} className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type d'entité</label>
            <select name="entityType" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cda34f] focus:ring-[#cda34f]">
              <option value="CUSTOMER">Clients (CUSTOMER)</option>
              <option value="EQUIPMENT">Équipements (EQUIPMENT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fichier CSV (simulé)</label>
            <input type="file" name="file" accept=".csv" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#cda34f] file:text-white hover:file:bg-[#b58b3f]"/>
          </div>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Lancer l'import
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">Note : l'import est simulé. Pour tester un rollback (FAILED), ajoutez le mot "ERROR" sur une ligne du fichier CSV.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job: any) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(job.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.entityType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.processedRows} / {job.totalRows}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    job.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/imports/${job.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Rapport
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Aucun historique d'import.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
