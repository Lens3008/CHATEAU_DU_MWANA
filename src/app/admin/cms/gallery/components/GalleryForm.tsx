'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGalleryAction, updateGalleryAction } from '@/lib/actions/gallery-actions';

export default function GalleryForm({ gallery = null }: { gallery?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (gallery) {
        await updateGalleryAction(gallery.id, formData);
      } else {
        await createGalleryAction(formData);
      }
      router.push('/admin/cms/gallery');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={gallery?.name || ''} 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cda34f] focus:ring-[#cda34f]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          name="description" 
          defaultValue={gallery?.description || ''} 
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cda34f] focus:ring-[#cda34f]"
        />
      </div>
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#cda34f] hover:bg-[#b58b3f]">
          {loading ? 'Enregistrement...' : (gallery ? 'Mettre à jour' : 'Créer')}
        </button>
      </div>
    </form>
  );
}
