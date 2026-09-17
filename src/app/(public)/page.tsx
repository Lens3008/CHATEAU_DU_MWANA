import Link from "next/link";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/public/MotionWrapper";
import { ChateauLine } from "@/components/public/ChateauLine";
import { ChateauLight } from "@/components/public/ChateauLight";
import { Sparkles, Calendar, Clock, Users, ArrowRight, HeartHandshake, Smile, Camera } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getPublicFormulas } from "@/lib/public-catalogue";
export const metadata = {
  title: "Le Château du Mwana | Accueil",
  description: "Un univers magique pour les enfants, une parenthèse de bonheur pour toute la famille.",
};

export default async function HomePage() {
  // 1. Fetch formulas
  const formulasRaw = await getPublicFormulas();

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

  const formulas = Array.from(groupedFormulas.values())
    .map((f: any) => ({
      ...f,
      name: f.baseName,
      price: f.minPrice,
      image: f.service?.images && f.service.images.length > 0 ? f.service.images[0].url : null
    }))
    .sort((a: any, b: any) => a.price - b.price)
    .slice(0, 3);

  // 2. Fetch gallery for masonry
  const galleryRaw = await (db.orm.public.GalleryItem as any)
    //@ts-ignore
    .include('media')
    //@ts-ignore
    .include('gallery')
    .all();

  const sortedGallery = galleryRaw.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).slice(0, 6);

  const galleryItems = sortedGallery.map((gi: any) => ({
    id: gi.id,
    mediaUrl: gi.media?.url,
    title: gi.gallery?.name,
  })).filter((gi: any) => gi.mediaUrl);
  
  // 3. Extract hero image (first gallery image as hero fallback, otherwise premium gradient)
  const heroMedia = galleryItems.length > 0 ? galleryItems[0].mediaUrl : null;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-public-bg)]">
      
      {/* 1. HERO IMMERSIF - Moment signature */}
      <section className="relative w-full h-[85vh] min-h-[500px] md:h-[90vh] md:min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
          {heroMedia ? (
            <>
              <img
                src={heroMedia}
                alt="Le Château du Mwana"
                className="w-full h-full object-cover"
                style={{ opacity: 0.7 }}
              />
              {/* Lumière chaude discrète */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-public-primary)]/5 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(15,23,42,1)_100%)]"></div>
            </div>
          )}
          {/* Overlay dégradé pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-public-bg)] via-slate-900/60 to-slate-900/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          {/* Badge d'accueil */}
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-public-primary)]" />
              <span>Bienvenue dans la magie</span>
            </div>
          </FadeIn>
          
          {/* Ligne architecturale sous le badge */}
          <div className="mb-8">
            <ChateauLine variant="accent" delay={0.2} duration={0.6} />
          </div>
          
          {/* Titre principal */}
          <FadeIn delay={0.3}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-[var(--font-display)] mb-6 drop-shadow-2xl leading-tight">
              Le Château du Mwana
            </h1>
          </FadeIn>

          {/* Promesse */}
          <FadeIn delay={0.4}>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-8 max-w-2xl mx-auto drop-shadow-lg font-sans">
              L'espace magique où les rêves de vos enfants prennent vie, et où toute la famille trouve son bonheur.
            </p>
          </FadeIn>

          {/* CTA avec effet lumière */}
          <ChateauLight delay={0.6} duration={1.2} className="inline-block">
            <FadeIn delay={0.5}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/reserver">
                  <Button className="bg-[var(--color-public-primary)] hover:bg-[var(--color-public-primary-hover)] text-slate-900 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 font-semibold border-none">
                    Réserver un événement
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Découvrir nos formules
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </ChateauLight>
        </div>
      </section>

      {/* 2. L'EXPÉRIENCE (Éditorial Premium) */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <FadeIn delay={0.2}>
              <div className="space-y-6">
                <h2 className="text-sm font-bold tracking-widest text-[var(--color-public-primary)] uppercase">L'Expérience</h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] font-bold text-[var(--color-public-text)] leading-tight">
                  Plus qu'un espace de jeux, une véritable aventure.
                </h3>
                <p className="text-base md:text-lg text-[var(--color-public-text-muted)] leading-relaxed">
                  Le Château du Mwana est un cocon féerique pensé pour les familles. Chaque recoin, chaque château et chaque activité a été imaginé pour dessiner des sourires sur les visages des enfants et offrir aux parents des moments de partage en toute sérénité.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-white shadow-md text-blue-600">
                      <Smile className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Émerveillement</h4>
                      <p className="text-sm text-slate-500">Des décors immersifs et des activités captivantes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-white shadow-md text-blue-600">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Service Premium</h4>
                      <p className="text-sm text-slate-500">Un accompagnement sur-mesure pour vos événements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3} className="relative">
              <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[var(--shadow-public-hover)] aspect-[4/5] md:aspect-square bg-slate-900 border border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent mix-blend-overlay z-10"></div>
                {galleryItems.length > 1 ? (
                  <img src={galleryItems[1].mediaUrl} alt="L'expérience Mwana" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.1)_0%,transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
                    
                    <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-slate-700/50 flex items-center justify-center">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-slate-600/50 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-full border border-yellow-500/20 bg-gradient-to-tr from-yellow-500/10 to-blue-500/10 flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="w-8 h-8 text-yellow-500/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Floating element - sans animate-bounce */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[var(--shadow-public-hover)] z-20 max-w-xs">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm md:text-base">Magie garantie</p>
                    <p className="text-xs md:text-sm text-slate-500">Des souvenirs inoubliables</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 3. NOS FORMULES (Cartes Enrichies) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <FadeIn className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[var(--color-public-primary)] uppercase mb-4">Événements</h2>
              <h3 className="text-4xl md:text-5xl font-[var(--font-display)] font-bold text-[var(--color-public-text)]">
                Des moments sur-mesure
              </h3>
            </FadeIn>
            <FadeIn delay={0.2} className="mt-6 md:mt-0">
              <Link href="/services">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 rounded-full px-6 py-6 text-lg">
                  Voir tout le catalogue <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </FadeIn>
          </div>

          {formulas.length > 0 ? (
            <StaggerContainer className="grid lg:grid-cols-3 gap-8">
              {formulas.map((formula: any) => (
                <StaggerItem key={formula.id} className="h-full">
                  <div className="group bg-[var(--color-public-surface-alt)] rounded-[2.5rem] p-8 h-full flex flex-col hover:bg-slate-900 hover:text-white transition-colors duration-500 shadow-[var(--shadow-public-card)] hover:shadow-[var(--shadow-public-hover)]">
                    <div className="flex justify-between items-start mb-8">
                      <h4 className="font-[var(--font-display)] font-bold text-2xl md:text-3xl pr-4 group-hover:text-white text-slate-900">
                        {formula.name}
                      </h4>
                      <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-slate-800 shrink-0">
                        <Sparkles className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    
                    <p className="text-slate-600 group-hover:text-slate-300 mb-8 flex-1 leading-relaxed">
                      {formula.description || "Une formule magique adaptée à vos besoins pour un événement inoubliable au Château du Mwana."}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      {typeof formula.duration === "number" && formula.duration > 0 && (
                        <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-300">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{formula.duration} minutes</span>
                        </div>
                      )}
                      {typeof formula.capacity === "number" && formula.capacity > 0 && (
                        <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-300">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Jusqu'à {formula.capacity} personnes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-slate-200 group-hover:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 group-hover:text-slate-400">{formula.isGroup ? "À partir de" : "Tarif unique"}</p>
                        <p className="text-2xl font-bold group-hover:text-white text-slate-900">{formatPrice(formula.price)}</p>
                      </div>
                      <Link href={`/reserver?formula=${formula.id}`}>
                        <Button className="rounded-full bg-slate-900 text-white group-hover:bg-yellow-500 group-hover:text-slate-900 shadow-md border-none">
                          Réserver
                        </Button>
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="max-w-4xl mx-auto text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-[var(--shadow-public-card)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -ml-32 -mb-32"></div>
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-6 relative z-10" />
              <h4 className="text-2xl font-bold font-[var(--font-display)] text-slate-900 mb-4 relative z-10">Bientôt de nouvelles formules</h4>
              <p className="text-slate-500 text-lg relative z-10 max-w-lg mx-auto">Notre équipe prépare activement de nouvelles prestations pour vous offrir des moments toujours plus magiques. Revenez très vite !</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. GALERIE (Masonry Dense) */}
      {galleryItems.length > 0 && (
        <section className="py-24 bg-slate-900 text-white overflow-hidden rounded-t-[3rem] md:rounded-t-[5rem]">
          <div className="container mx-auto px-4 text-center mb-16">
            <FadeIn>
              <h2 className="text-sm font-bold tracking-widest text-[var(--color-public-primary)] uppercase mb-4">L'Univers</h2>
              <h3 className="text-4xl md:text-5xl font-[var(--font-display)] font-bold text-white mb-8">
                Plongez dans la magie
              </h3>
            </FadeIn>
          </div>

          <div className="container mx-auto px-4">
            <StaggerContainer className="masonry-grid">
              {galleryItems.map((item: any) => (
                <StaggerItem key={item.id} className="masonry-item">
                  <div className="relative group rounded-3xl overflow-hidden cursor-pointer bg-slate-800">
                    <img 
                      src={item.mediaUrl} 
                      alt={item.title || "Galerie"} 
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="font-bold text-lg">{item.title}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            <div className="text-center mt-12">
              <Link href="/gallery">
                <Button variant="outline" className="border-white/30 text-slate-800 bg-white hover:bg-slate-100 rounded-full px-8 py-6 text-lg">
                  Voir toute la galerie
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. CTA FINAL */}
      <section className="py-32 bg-[var(--color-public-primary)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-[var(--font-display)] font-bold text-slate-900 mb-8 max-w-3xl mx-auto leading-tight">
              Prêt à offrir un moment magique ?
            </h2>
            <Link href="/reserver">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-12 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-transform duration-300">
                Commencer la réservation
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
