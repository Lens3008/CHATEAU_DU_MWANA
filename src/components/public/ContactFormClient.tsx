'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitContactMessageAction } from '@/lib/actions/submit-contact';
import { FadeIn } from '@/components/public/MotionWrapper';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export default function ContactFormClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const res = await submitContactMessageAction(data);
    
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || 'Erreur inconnue.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <FadeIn className="bg-white p-10 rounded-3xl text-center shadow-lg border border-slate-100">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold font-[var(--font-display)] text-slate-800 mb-2">Message envoyé !</h3>
        <p className="text-slate-500 mb-8">Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <Button variant="public-outline" onClick={() => setSuccess(false)}>Envoyer un autre message</Button>
      </FadeIn>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-[var(--shadow-public-card)] border border-slate-100 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="name">Votre Nom *</label>
          <input 
            id="name" name="name" required
            className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] outline-none" 
            placeholder="Jean Dupont"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="email">Adresse Email *</label>
          <input 
            id="email" name="email" type="email" required
            className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] outline-none" 
            placeholder="jean@example.com"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="phone">Téléphone</label>
          <input 
            id="phone" name="phone"
            className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] outline-none" 
            placeholder="06 XX XX XX XX"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="subject">Sujet *</label>
          <select 
            id="subject" name="subject" required
            className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] outline-none bg-white"
          >
            <option value="Information">Demande d'information</option>
            <option value="Devis">Demande de devis</option>
            <option value="Support">Support technique</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="message">Votre Message *</label>
        <textarea 
          id="message" name="message" required rows={5}
          className="w-full rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-[var(--color-public-primary)] outline-none resize-y" 
          placeholder="Dites-nous tout..."
        />
      </div>

      <Button variant="public-primary" size="lg" className="w-full sm:w-auto" type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
        {loading ? 'Envoi...' : 'Envoyer le message'}
      </Button>
    </form>
  );
}
