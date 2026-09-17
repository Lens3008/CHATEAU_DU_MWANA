import { requireAuth, requireRole } from '@/lib/auth/user';
import TemplateForm from '../components/TemplateForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function NewTemplatePage() {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cms/templates" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau modèle</h1>
      </div>
      <TemplateForm />
    </div>
  );
}
