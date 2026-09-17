'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplateAction, updateTemplateAction } from '@/lib/actions/templates-actions';

export default function TemplateForm({ template = null }: { template?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (template) {
        await updateTemplateAction(template.id, formData);
      } else {
        await createTemplateAction(formData);
      }
      router.push('/admin/cms/templates');
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
        <label className="block text-sm font-medium text-gray-700">Type de document</label>
        <select 
          name="type" 
          defaultValue={template?.type || 'INVOICE'} 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cda34f] focus:ring-[#cda34f]"
        >
          <option value="INVOICE">Facture (INVOICE)</option>
          <option value="CONTRACT">Contrat (CONTRACT)</option>
          <option value="QUOTE">Devis (QUOTE)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu (HTML/Texte)</label>
        <textarea 
          name="content" 
          defaultValue={template?.content || ''} 
          rows={10}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cda34f] focus:ring-[#cda34f] font-mono text-sm"
        />
      </div>
      <div className="flex items-center">
        <input 
          type="checkbox" 
          name="isActive" 
          id="isActive"
          defaultChecked={template ? template.isActive : true} 
          className="h-4 w-4 text-[#cda34f] focus:ring-[#cda34f] border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Actif (Défaut pour ce type)</label>
      </div>
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#cda34f] hover:bg-[#b58b3f]">
          {loading ? 'Enregistrement...' : (template ? 'Mettre à jour' : 'Créer')}
        </button>
      </div>
    </form>
  );
}
