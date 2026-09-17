import { requireRole } from '@/lib/auth/user';
import { getPageByIdAction } from '@/lib/actions/cms-actions';
import PageForm from '../components/PageForm';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Éditer Page | CMS | Le Château du Mwana',
};

export default async function EditPagePage({ params }: { params: { id: string } }) {
  await requireRole(['ADMIN']);

  const page = await getPageByIdAction(params.id);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Éditer la page : {page.title}</h1>
        <p className="text-slate-500 mt-1">Modifiez le contenu et les paramètres de cette page</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PageForm initialData={page} />
      </div>
    </div>
  );
}
