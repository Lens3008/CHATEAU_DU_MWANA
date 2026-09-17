import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/public/MotionWrapper";
import { Sparkles, Calendar, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ChateauLine } from "@/components/public/ChateauLine";
import { getPublicFormulas, getPublicServices } from "@/lib/public-catalogue";
export const metadata = {
  title: "Nos Prestations | Le Château du Mwana",
  description: "Découvrez toutes nos formules et services premium pour vos événements.",
};

export default async function ServicesPage() {
  const formulasRaw = await getPublicFormulas();
  formulasRaw.sort((a: any, b: any) => Number(a.price) - Number(b.price));

  const groupedFormulas = new Map();
  formulasRaw.forEach((f: any) => {
    let baseName = f.name;
    if (baseName.includes(' - ')) {
      baseName = baseName.split(' - ')[0];
    }
    if (!groupedFormulas.has(baseName)) {
      groupedFormulas.set(baseName, { ...f, baseName, minPrice: f.price, isGroup: baseName !== f.name });
    } else {
      const existing = groupedFormulas.get(baseName);
      if (f.price < existing.minPrice) {
        existing.minPrice = f.price;
        existing.id = f.id;
      }
      existing.isGroup = true;
    }
  });

  const formulas = Array.from(groupedFormulas.values()).map((f: any) => ({
    ...f,
    name: f.baseName,
    price: f.minPrice,
    image: f.service?.images && f.service.images.length > 0 ? f.service.images[0].url : null
  }));

  const combos = formulas.filter((f: any) => f.name.includes('Combo') && !f.name.includes('Kermesse')).sort((a: any, b: any) => a.price - b.price);
  const anniversaires = formulas.filter((f: any) => f.name.includes('Anniversaire')).sort((a: any, b: any) => a.price - b.price);
  const kermesses = formulas.filter((f: any) => f.name.includes('Kermesse')).sort((a: any, b: any) => a.price - b.price);

  const servicesRaw = await getPublicServices();
  servicesRaw.sort((a: any, b: any) => Number(a.basePrice) - Number(b.basePrice));

  const services = servicesRaw.map((s: any) => ({
    ...s,
    image: s.images && s.images.length > 0 ? s.images[0].url : null
  }));

  const renderFormulaCard = (formula: any) => (
    <StaggerItem key={formula.id} className="h-full">
      <div className="group bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 h-full flex flex-col shadow-[var(--shadow-public-card)] hover:shadow-[var(--shadow-public-hover)] hover:-translate-y-1 transition-all duration-300 border border-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {formula.image && (
          <div className="relative z-10 mb-4 md:mb-6 -mx-2 md:-mx-4 -mt-2 md:-mt-4 rounded-xl md:rounded-2xl overflow-hidden h-40 md:h-48">
            <img src={formula.image} alt={formula.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
          </div>
        )}

        <div className="relative z-10 flex justify-between items-start mb-4 md:mb-6">
          <h3 className="font-[var(--font-display)] font-bold text-xl md:text-2xl lg:text-3xl text-slate-900">
            {formula.name}
          </h3>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-public-primary)]/10 transition-colors">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500 group-hover:text-[var(--color-public-primary)] transition-colors" />
          </div>
        </div>
        
        <p className="relative z-10 text-slate-500 mb-6 md:mb-8 flex-1 leading-relaxed text-sm md:text-base">
          {formula.description || "Une formule magique adaptée à vos besoins."}
        </p>
        
        <div className="relative z-10 mt-auto pt-4 md:pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-slate-400 mb-1">{formula.isGroup ? "À partir de" : "Tarif unique"}</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{formatPrice(formula.price)}</p>
          </div>
          <Link href={`/reserver?formula=${formula.id}`}>
            <Button className="rounded-full bg-[var(--color-public-primary)] hover:bg-[var(--color-public-primary-hover)] text-slate-900 shadow-md h-10 md:h-12 px-4 md:px-6 text-sm md:text-base">
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </StaggerItem>
  );

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-32">
      
      {/* HEADER HERO PRESTATIONS */}
      <div className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 opacity-90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-public-primary)]" />
              <span>Catalogue</span>
            </div>
            <div className="mb-6">
              <ChateauLine variant="accent" delay={0.1} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-[var(--font-display)] mb-6 text-white leading-tight">
              Nos Prestations
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Des offres sur-mesure conçues pour transformer chaque instant en un souvenir mémorable.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20">
        
        {/* COMBOS */}
        {combos.length > 0 && (
          <div className="mb-24">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-slate-900 mb-4">Formules Principales</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">L'essentiel pour créer une journée de fête inoubliable.</p>
            </FadeIn>
            <StaggerContainer className="grid lg:grid-cols-3 gap-10">
              {combos.map(renderFormulaCard)}
            </StaggerContainer>
          </div>
        )}

        {/* ANNIVERSAIRES */}
        {anniversaires.length > 0 && (
          <div className="mb-24">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-slate-900 mb-4">Anniversaires</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Des moments uniques pour souffler ses bougies entouré de rires et de joie.</p>
            </FadeIn>
            <StaggerContainer className="grid lg:grid-cols-3 gap-10">
              {anniversaires.map(renderFormulaCard)}
            </StaggerContainer>
          </div>
        )}

        {/* KERMESSES */}
        {kermesses.length > 0 && (
          <div className="mb-24">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-slate-900 mb-4">Kermesses</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">L'ambiance magique des grands jours pour rassembler et émerveiller.</p>
            </FadeIn>
            <StaggerContainer className="grid lg:grid-cols-3 gap-10">
              {kermesses.map(renderFormulaCard)}
            </StaggerContainer>
          </div>
        )}

        {/* SERVICES / OPTIONS */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] text-slate-900 mb-4">À la carte</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">De petites touches supplémentaires pour prolonger la magie.</p>
        </FadeIn>

        {services.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center p-12 bg-transparent border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400">
            Aucun service additionnel n'est disponible.
          </div>
        ) : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <StaggerItem key={service.id}>
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-public-card)] hover:shadow-[var(--shadow-public-hover)] hover:-translate-y-1 transition-all border border-slate-50 group flex flex-col h-full">
                  {service.image && (
                    <div className="mb-4 -mx-2 -mt-2 rounded-2xl overflow-hidden h-32 relative">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                  )}
                  <h4 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{service.name}</h4>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1">{service.description || "Option premium pour compléter votre réservation."}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="font-bold text-slate-900 text-lg">
                      +{formatPrice(service.basePrice)}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
