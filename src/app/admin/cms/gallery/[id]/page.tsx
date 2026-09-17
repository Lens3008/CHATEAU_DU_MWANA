// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getGallery } from '@/lib/services/gallery';
import GalleryForm from '../components/GalleryForm';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMedias } from '@/lib/services/media';
import { addMediaAction, removeMediaAction } from '@/lib/actions/gallery-actions';

export default async function EditGalleryPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  const gallery: any = await getGallery(params.id);
  if (!gallery) notFound();

  const allMedias = await getMedias();
  const availableMedias = allMedias.filter((m: any) => !gallery.items.find((i: any) => i.mediaId === m.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cms/gallery" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier : {gallery.name}</h1>
      </div>
      
      <GalleryForm gallery={gallery} />

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Médias de la galerie</h2>
        
        {gallery.items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.items.map((item: any) => (
              <div key={item.id} className="relative group rounded-lg overflow-hidden border">
                {item.media.type === 'IMAGE' ? (
                  <img src={item.media.url} alt={item.media.altText || ''} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-500">
                    {item.media.type}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <form action={async () => {
                    'use server'
                    await removeMediaAction(item.id, gallery.id);
                  }}>
                    <button type="submit" className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucun média dans cette galerie.</p>
        )}

        <hr className="my-6" />

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un média</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableMedias.map((media: any) => (
              <div key={media.id} className="relative group rounded-lg overflow-hidden border">
                {media.type === 'IMAGE' ? (
                  <img src={media.url} alt={media.altText || ''} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 text-gray-500">
                    {media.type}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <form action={async () => {
                    'use server'
                    await addMediaAction(gallery.id, media.id, gallery.items.length);
                  }}>
                    <button type="submit" className="px-4 py-2 bg-[#cda34f] text-white rounded hover:bg-[#b58b3f]">
                      Ajouter
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
