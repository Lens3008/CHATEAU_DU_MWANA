import { requireAuth, requireRole } from '@/lib/auth/user';
import { getGalleries } from '@/lib/services/gallery';
import Link from 'next/link';

export const metadata = {
  title: 'Galeries | CMS | Le Château du Mwana',
};

export default async function GalleriesPage() {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  const galleries = await getGalleries();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Galeries</h1>
          <p className="text-slate-500 mt-1">Gérez les albums photos et collections de médias</p>
        </div>
        <Link 
          href="/admin/cms/gallery/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          Nouvelle galerie
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {galleries.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">
            Aucune galerie créée pour le moment.
          </div>
        ) : (
          galleries.map((gallery: any) => (
            <div key={gallery.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{gallery.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{gallery.description || 'Aucune description'}</p>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">{gallery.items?.length || 0} éléments</span>
                <Link 
                  href={`/admin/cms/gallery/${gallery.id}`}
                  className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                >
                  Gérer
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
