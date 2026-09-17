// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getMediasAction } from '@/lib/actions/media-actions';
import MediaManager from './MediaManager';

export const metadata = {
  title: 'Médias | CMS | Le Château du Mwana',
};

export default async function MediaPage() {
  const user = await requireRole(['ADMIN']);

  const medias = await getMediasAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Médiathèque</h1>
          <p className="text-slate-500 mt-1">Gérez vos images, vidéos et documents</p>
        </div>
      </div>

      <MediaManager initialMedias={medias} />
    </div>
  );
}
