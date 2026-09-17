import { requireAuth, requireRole } from '@/lib/auth/user';
import { getPages } from '@/lib/services/cms';
import { getGalleries } from '@/lib/services/gallery';
import { getMedias } from '@/lib/services/media';
import { getContactMessages } from '@/lib/services/contact';
import Link from 'next/link';

export const metadata = {
  title: 'CMS Dashboard | Le Château du Mwana',
};

export default async function CMSDashboard() {
  const user = await requireAuth();
  await requireRole(['ADMIN']);

  const pages = await getPages();
  const medias = await getMedias();
  const galleries = await getGalleries();
  const messages = await getContactMessages();

  const publishedPages = pages.filter((p: any) => p.isPublished).length;
  const unreadMessages = messages.filter((m: any) => m.status === 'NEW').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestion de Contenu (CMS)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/cms/pages" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors group">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Pages</h3>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{pages.length}</p>
          <p className="text-xs text-slate-400 mt-2">{publishedPages} publiées</p>
        </Link>
        <Link href="/admin/cms/media" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors group">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Médias</h3>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{medias.length}</p>
          <p className="text-xs text-slate-400 mt-2">Images, vidéos, documents</p>
        </Link>
        <Link href="/admin/cms/gallery" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors group">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Galeries</h3>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{galleries.length}</p>
          <p className="text-xs text-slate-400 mt-2">Collections de médias</p>
        </Link>
        <Link href="/admin/contact" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors group relative">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Messages de contact</h3>
          <p className="text-3xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{messages.length}</p>
          {unreadMessages > 0 && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
          <p className="text-xs text-rose-500 font-medium mt-2">{unreadMessages} non lu(s)</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Configuration globale</h2>
          <div className="space-y-3">
            <Link href="/admin/cms/settings" className="block p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="font-medium text-slate-800">Paramètres du site</div>
              <div className="text-sm text-slate-500">Informations publiques, réseaux sociaux, contacts...</div>
            </Link>
            <Link href="/admin/cms/templates" className="block p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="font-medium text-slate-800">Modèles de documents</div>
              <div className="text-sm text-slate-500">Gérer les templates pour les factures et contrats.</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
