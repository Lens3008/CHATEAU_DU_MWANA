import { requireAuth, requireRole } from '@/lib/auth/user';
import GalleryForm from '../components/GalleryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function NewGalleryPage() {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cms/gallery" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Galerie</h1>
      </div>
      <GalleryForm />
    </div>
  );
}
