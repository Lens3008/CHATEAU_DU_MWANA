import { db } from '@/lib/prisma';
import BookingWizardClient from '@/components/public/BookingWizardClient';
import { Sparkles } from "lucide-react";
import { FadeIn } from "@/components/public/MotionWrapper";
import { getPublicFormulas } from "@/lib/public-catalogue";

export const metadata = {
  title: 'Réserver | Le Château du Mwana',
  description: 'Réservez votre espace de jeux et événements au Château du Mwana.',
};

export default async function ReserverPage() {
  // Fetch real formulas and locations using Prisma 8 ORM (consistent with all other pages)
  const publicFormulas = await getPublicFormulas();
  const formattedFormulas = publicFormulas
    .sort((a: any, b: any) => Number(a.price) - Number(b.price))
    .map((f: any) => ({
      id: f.id,
      name: f.name,
      price: Number(f.price),
      description: f.description,
      maxCapacity: typeof f.capacity === 'number' && f.capacity > 0 ? f.capacity : null,
    }));

  const allLocations = await db.orm.public.Location.all();
  const locations = allLocations.filter((l: any) => l.isChateau === true)
    .map((l: any) => ({
      id: l.id,
      name: l.name,
      type: l.isChateau ? 'VENUE' : 'EXTERNAL',
    }));

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-32">
      
      {/* HEADER HERO RESERVATION */}
      <div className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-[var(--color-public-primary)] opacity-80 mix-blend-multiply" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Réservation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] mb-4 text-white leading-tight">
              Réserver votre événement
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light">
              Laissez-nous prendre en charge l'organisation pour un moment magique et sans stress.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-[-40px] relative z-20 max-w-5xl">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[var(--shadow-public-hover)] overflow-hidden border border-slate-50 p-6 md:p-12">
          <BookingWizardClient formulas={formattedFormulas} locations={locations} />
        </div>
      </div>
    </div>
  );
}
