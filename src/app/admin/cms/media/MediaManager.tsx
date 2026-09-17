'use client';

import { useState } from 'react';
import { uploadMediaAction, deleteMediaAction } from '@/lib/actions/media-actions';
import { useRouter } from 'next/navigation';

export default function MediaManager({ initialMedias }: { initialMedias: any[] }) {
  const [medias, setMedias] = useState(initialMedias);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);

      await uploadMediaAction(formData);
      router.refresh();
      // On a real app we might fetch again or let refresh() re-render
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce média ?')) return;
    try {
      await deleteMediaAction(id);
      setMedias(medias.filter(m => m.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 mb-6">
        <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors shadow-sm">
          {isUploading ? 'Upload en cours...' : 'Uploader un fichier'}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,video/mp4,application/pdf"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {medias.map(media => (
          <div key={media.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
            {media.type === 'IMAGE' ? (
              <img src={media.url} alt={media.altText || ''} className="object-cover w-full h-full" />
            ) : media.type === 'VIDEO' ? (
              <div className="flex items-center justify-center w-full h-full text-slate-400">Vidéo</div>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-slate-400">PDF</div>
            )}
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <button 
                  onClick={() => handleDelete(media.id)}
                  className="bg-rose-500 text-white p-1.5 rounded hover:bg-rose-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-white text-xs truncate" title={media.url}>
                {media.altText || 'Media'}
              </p>
            </div>
          </div>
        ))}
        {medias.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Aucun média disponible.
          </div>
        )}
      </div>
    </div>
  );
}
