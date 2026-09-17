import { requireRole } from '@/lib/auth/user';
import PageForm from '../components/PageForm';

export const metadata = {
  title: 'Nouvelle Page | CMS | Le Château du Mwana',
};

export default async function NewPagePage() {
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Nouvelle Page</h1>
        <p className="text-slate-500 mt-1">Créez une nouvelle page publique pour le site</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PageForm />
      </div>
    </div>
  );
}
