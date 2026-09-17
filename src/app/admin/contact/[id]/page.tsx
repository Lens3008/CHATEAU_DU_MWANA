import { requireAuth, requireRole } from '@/lib/auth/user';
import { getContactMessage } from '@/lib/services/contact';
import { updateContactMessageStatusAction } from '@/lib/actions/contact-actions';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ContactMessageDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);

  const msg = await getContactMessage(params.id);
  if (!msg) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contact" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Message de {msg.name}</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Expéditeur</p>
            <p className="font-medium text-gray-900">{msg.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900"><a href={`mailto:${msg.email}`} className="text-indigo-600">{msg.email}</a></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Téléphone</p>
            <p className="font-medium text-gray-900">{msg.phone || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-gray-900">{new Date(msg.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Message</p>
          <div className="p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap font-mono text-sm border">
            {msg.message}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Statut de traitement</p>
          <div className="flex gap-4">
            <form action={async () => { 'use server'; await updateContactMessageStatusAction(msg.id, 'NEW'); }}>
              <button type="submit" className={`px-4 py-2 rounded-md font-medium text-sm border ${msg.status === 'NEW' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white text-gray-700'}`}>Nouveau</button>
            </form>
            <form action={async () => { 'use server'; await updateContactMessageStatusAction(msg.id, 'READ'); }}>
              <button type="submit" className={`px-4 py-2 rounded-md font-medium text-sm border ${msg.status === 'READ' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white text-gray-700'}`}>Lu</button>
            </form>
            <form action={async () => { 'use server'; await updateContactMessageStatusAction(msg.id, 'REPLIED'); }}>
              <button type="submit" className={`px-4 py-2 rounded-md font-medium text-sm border ${msg.status === 'REPLIED' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white text-gray-700'}`}>Répondu</button>
            </form>
            <form action={async () => { 'use server'; await updateContactMessageStatusAction(msg.id, 'ARCHIVED'); }}>
              <button type="submit" className={`px-4 py-2 rounded-md font-medium text-sm border ${msg.status === 'ARCHIVED' ? 'bg-gray-200 border-gray-400 text-gray-800' : 'bg-white text-gray-700'}`}>Archivé</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
