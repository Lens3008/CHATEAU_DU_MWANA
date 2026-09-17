import { db } from "@/lib/prisma";
import { FadeIn } from "@/components/public/MotionWrapper";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { Sparkles } from "lucide-react";
import { ChateauLine } from "@/components/public/ChateauLine";

export const metadata = {
  title: "Galerie | Le Château du Mwana",
  description: "Parcourez les souvenirs féeriques du Château du Mwana.",
};

export default async function GalleryPage() {
  const galleryRaw = await (db.orm.public.GalleryItem as any)
    //@ts-ignore
    .include('media')
    //@ts-ignore
    .include('gallery')
    .all();

  const sortedRaw = galleryRaw.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const items = sortedRaw.map((gi: any) => ({
    id: gi.id,
    mediaUrl: gi.media?.url,
    title: gi.gallery?.name,
    description: gi.gallery?.description
  })).filter((gi: any) => gi.mediaUrl);

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-32">
      
      {/* HEADER HERO GALERIE */}
      <div className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 opacity-90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-public-primary)]" />
              <span>Souvenirs</span>
            </div>
            <div className="mb-6">
              <ChateauLine variant="accent" delay={0.1} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-[var(--font-display)] mb-6 text-white leading-tight">
              La Galerie Magique
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Revivez les plus beaux moments passés en famille dans nos espaces.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20">
        <GalleryGrid items={items} />
      </div>
    </div>
  );
}
