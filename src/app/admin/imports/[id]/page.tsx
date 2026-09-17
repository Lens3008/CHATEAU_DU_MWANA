// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getImportJob } from '@/lib/services/imports';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ImportDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  await requireRole(['ADMIN', 'SUPERVISOR']);

  const job = await getImportJob(params.id);
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/imports" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Rapport d'import</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">ID du Job</p>
            <p className="font-mono text-sm text-gray-900">{job.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type d'entité</p>
            <p className="font-medium text-gray-900">{job.entityType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lignes traitées</p>
            <p className="font-medium text-gray-900">{job.processedRows} / {job.totalRows}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut final</p>
            <p className={`font-bold ${(job as any).status === 'COMPLETED' ? 'text-green-600' : (job as any).status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
              {(job as any).status}
            </p>
          </div>
        </div>

        {job.errors && job.errors.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-4">Erreurs rencontrées ({job.errors.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Ligne</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Détail</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Donnée brute</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {job.errors.map((err: any) => (
                    <tr key={err.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{err.rowNumber}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{err.errorDetail}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500 max-w-xs truncate" title={err.rawData || ''}>{err.rawData}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
