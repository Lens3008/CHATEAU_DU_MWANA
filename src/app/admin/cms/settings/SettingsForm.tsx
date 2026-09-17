// @ts-nocheck
'use client';
import { useState } from 'react';
import { updateSettingAction } from '@/lib/actions/settings-actions';
import { useRouter } from 'next/navigation';

export default function SettingsForm({ initialSettings }: { initialSettings: any[] }) {
  const [settings, setSettings] = useState(
    initialSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await updateSettingAction(key, value as string);
      }
      alert('Paramètres enregistrés avec succès.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Site</label>
          <input 
            type="text" 
            value={settings['SITE_NAME'] || ''}
            onChange={e => handleChange('SITE_NAME', e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email de contact</label>
          <input 
            type="email" 
            value={settings['CONTACT_EMAIL'] || ''}
            onChange={e => handleChange('CONTACT_EMAIL', e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone public</label>
          <input 
            type="text" 
            value={settings['CONTACT_PHONE'] || ''}
            onChange={e => handleChange('CONTACT_PHONE', e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lien Instagram</label>
          <input 
            type="url" 
            value={settings['SOCIAL_INSTAGRAM'] || ''}
            onChange={e => handleChange('SOCIAL_INSTAGRAM', e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  );
}
