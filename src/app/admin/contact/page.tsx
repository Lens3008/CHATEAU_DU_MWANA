import { requireAuth, requireRole } from '@/lib/auth/user';
import { getContactMessages } from '@/lib/services/contact';
import Link from 'next/link';
import { EmptyMessages } from '@/components/ui/empty';

export const metadata = { title: 'Messages de Contact | Admin | Le Château du Mwana' };

export default async function ContactMessagesPage() {
  const user = await requireAuth();
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);

  const messages = await getContactMessages();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Messages de contact</h1>
          <p className="text-slate-500 mt-1">Gérez les demandes de contact reçues via le site public</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="relative w-full overflow-auto mobile-table-scroll">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12">
                  <EmptyMessages />
                </td>
              </tr>
            ) : (
              messages.map((msg: any) => (
              <tr key={msg.id} className={msg.status === 'NEW' ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(msg.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{msg.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    msg.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' :
                    msg.status === 'READ' ? 'bg-blue-100 text-blue-800' :
                    msg.status === 'REPLIED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/contact/${msg.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Consulter
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
