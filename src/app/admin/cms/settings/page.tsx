// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getSettingsAction } from '@/lib/actions/settings-actions';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Paramètres | CMS | Le Château du Mwana',
};

export default async function SettingsPage() {
  const user = await requireRole(['ADMIN']); // Admin only

  const settings = await getSettingsAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Paramètres du Site</h1>
          <p className="text-slate-500 mt-1">Gérez la configuration globale du site</p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
