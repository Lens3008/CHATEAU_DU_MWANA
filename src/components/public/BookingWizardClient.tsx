'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { createReservationAction } from '@/lib/actions/reservation-actions';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/public/MotionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '@/lib/format';

type FormulaType = { id: string, name: string, price: number, description: string | null, maxCapacity: number | null };
type LocationType = { id: string, name: string, type: string };

export default function BookingWizardClient({ formulas, locations }: { formulas: FormulaType[], locations: LocationType[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formulaId, setFormulaId] = useState('');
  const [participants, setParticipants] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [locationId, setLocationId] = useState('');
  
  // customerId is determined server-side via getCurrentUser()
  // The browser NEVER sends a customerId — identity comes from session only

  const handleNext = () => {
    setError(null);
    setStep(s => Math.min(s + 1, 4));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateObj = new Date(`${startDate}T${startTime}:00`);
      const loc = locations.find(l => l.id === locationId);
      
      const result = await createReservationAction({
        formulaId,
        startDate: dateObj.toISOString(),
        participants,
        locationId: loc?.id || locations[0]?.id,
        locationType: (loc?.type as any) || 'VENUE'
      });

      if ((result as any).success) {
        setStep(5); 
      } else {
        setError((result as any).error);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFormula = formulas.find(f => f.id === formulaId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-[var(--color-public-text)]">
          Réserver un moment inoubliable
        </h1>
        <div className="flex items-center justify-center mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= i ? 'bg-[var(--color-public-primary)] text-white shadow-md' : 'bg-slate-200 text-slate-400'
              }`}>
                {i}
              </div>
              {i < 4 && (
                <div className={`w-12 sm:w-20 h-1.5 transition-colors ${step > i ? 'bg-[var(--color-public-primary)]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-public)] shadow-[var(--shadow-public-card)] border border-slate-100 p-6 md:p-10 relative overflow-hidden">
        {/* Subtle decorative wave */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-100/40 rounded-full blur-3xl pointer-events-none"></div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-3">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
        {/* Step 1: Formule */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-3 mb-6">
              <span className="bg-yellow-100 text-[var(--color-public-primary)] p-2 rounded-xl"><TagIcon className="w-5 h-5" /></span>
              Choisissez votre formule
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {formulas.map(f => (
                <div 
                  key={f.id}
                  onClick={() => setFormulaId(f.id)}
                  className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 ${
                    formulaId === f.id ? 'border-[var(--color-public-primary)] bg-yellow-50/50 shadow-md transform scale-[1.02]' : 'border-slate-100 hover:border-yellow-200 hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-bold font-[var(--font-display)] text-xl text-slate-900">{f.name}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{f.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {f.maxCapacity !== null && (
                      <span className="text-sm font-medium bg-slate-100 px-3 py-1 rounded-full text-slate-600">Max {f.maxCapacity} enf.</span>
                    )}
                    <span className="text-[var(--color-public-primary)] font-bold text-xl">{formatPrice(f.price)}</span>
                  </div>
                </div>
              ))}
              {formulas.length === 0 && (
                <div className="col-span-2 text-center py-10 text-slate-500 bg-slate-50 rounded-2xl">
                  Aucune formule n'est disponible pour le moment.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Participants */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-3 mb-6">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Calendar className="w-5 h-5" /></span>
              Date et Participants
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Date de l'événement</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Heure souhaitée</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between">
                  Nombre d'enfants participants
                  {selectedFormula?.maxCapacity !== null && selectedFormula?.maxCapacity !== undefined && (
                    <span className="text-slate-400 font-normal">Max: {selectedFormula.maxCapacity}</span>
                  )}
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={selectedFormula?.maxCapacity ?? undefined}
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-[var(--color-public-primary)] focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Lieu */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-3 mb-6">
              <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><MapPin className="w-5 h-5" /></span>
              Lieu de l'événement
            </h2>
            <div className="grid gap-4">
              {locations.map(l => (
                <div 
                  key={l.id}
                  onClick={() => setLocationId(l.id)}
                  className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-5 transition-all duration-300 ${
                    locationId === l.id ? 'border-[var(--color-public-primary)] bg-yellow-50/50 shadow-sm' : 'border-slate-100 hover:border-yellow-200'
                  }`}
                >
                  <div className={`p-3 rounded-full ${locationId === l.id ? 'bg-[var(--color-public-primary)] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{l.name}</h3>
                    <p className="text-sm text-slate-500">{l.type === 'VENUE' ? 'Dans nos locaux aménagés' : 'Nous nous déplaçons chez vous'}</p>
                  </div>
                </div>
              ))}
              {locations.length === 0 && (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-2xl">
                  Aucun lieu de réservation n'est configuré.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Récapitulatif */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-3 mb-6">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-xl"><CheckCircle2 className="w-5 h-5" /></span>
              Récapitulatif
            </h2>
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-medium">Formule</span>
                <span className="font-bold text-lg text-slate-900">{selectedFormula?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-medium">Date & Heure</span>
                <span className="font-bold text-slate-900">{startDate} à {startTime}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-medium">Participants</span>
                <span className="font-bold text-slate-900">{participants} enfants</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-medium">Lieu</span>
                <span className="font-bold text-slate-900">{locations.find(l => l.id === locationId)?.name}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-xl font-bold font-[var(--font-display)] text-slate-900">Total Estimé</span>
                <span className="text-3xl font-black text-[var(--color-public-primary)]">
                  {selectedFormula?.price ? formatPrice(selectedFormula.price) : '0 FCFA'}
                </span>
              </div>
              <p className="text-xs text-slate-400 text-right">Le montant final sera confirmé par notre équipe.</p>
            </div>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-12 text-center"
          >
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-slate-900 mb-4">Magie en préparation !</h2>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto text-lg">
              Votre réservation a été envoyée avec succès. Notre équipe vous contactera très vite pour finaliser les détails de cet événement féerique.
            </p>
            <Button 
              variant="public-primary" 
              size="lg"
              onClick={() => router.push('/')}
            >
              Retourner à l'accueil
            </Button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1 || loading}
              className="text-slate-600 rounded-full px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            
            {step < 4 ? (
              <Button
                variant="public-primary"
                onClick={handleNext}
                disabled={
                  (step === 1 && !formulaId) ||
                  (step === 2 && (!startDate || !startTime || participants < 1)) ||
                  (step === 3 && !locationId)
                }
                className="px-8"
              >
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="public-primary"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 shadow-[var(--shadow-public-card)]"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {loading ? 'Traitement...' : 'Confirmer ma réservation'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TagIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
}
