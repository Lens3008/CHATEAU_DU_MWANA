import { requireAuth, requireRole } from '@/lib/auth/user';
import { getTemplate } from '@/lib/services/templates';
import TemplateForm from '../components/TemplateForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteTemplateAction } from '@/lib/actions/templates-actions';

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  const template = await getTemplate(params.id);
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms/templates" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier modèle : {template.type}</h1>
        </div>
        <form action={async () => {
          'use server'
          await deleteTemplateAction(template.id);
        }}>
          <button type="submit" className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg">
            Supprimer ce modèle
          </button>
        </form>
      </div>
      
      <TemplateForm template={template} />
    </div>
  );
}
