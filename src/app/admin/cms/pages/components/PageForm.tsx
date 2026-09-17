'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPageAction, updatePageAction, deletePageAction } from '@/lib/actions/cms-actions';

export default function PageForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    isPublished: initialData?.isPublished || false
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: initialData ? prev.slug : generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData?.id) {
        const res = await updatePageAction(initialData.id, formData);
        if (res.error) throw new Error(res.error);
      } else {
        const res = await createPageAction(formData);
        if (res.error) throw new Error(res.error);
      }
      router.push('/admin/cms/pages');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;
    setLoading(true);
    try {
      await deletePageAction(initialData.id);
      router.push('/admin/cms/pages');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
        <input 
          type="text" 
          value={formData.title}
          onChange={handleTitleChange}
          required
          className="w-full border border-slate-300 rounded-lg p-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
        <input 
          type="text" 
          value={formData.slug}
          onChange={(e) => setFormData({...formData, slug: e.target.value})}
          required
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          title="Lettres minuscules, chiffres et tirets uniquement"
          className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
        />
        <p className="text-sm text-slate-500 mt-1">L'URL sera : https://votresite.com/<b>{formData.slug || 'slug'}</b></p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contenu (HTML autorisé)</label>
        <textarea 
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          required
          rows={10}
          className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-sm"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
          className="rounded text-indigo-600"
        />
        <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">Publier immédiatement</label>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <div className="flex space-x-3">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer la page')}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            disabled={loading}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-lg font-medium"
          >
            Annuler
          </button>
        </div>
        
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
