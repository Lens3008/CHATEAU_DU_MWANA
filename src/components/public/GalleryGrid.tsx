"use client";

import { useRef, useState } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/public/MotionWrapper";
import { Lightbox } from "@/components/public/Lightbox";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  mediaUrl: string;
  title: string | null;
  description: string | null;
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-[var(--shadow-public-card)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_100%)]"></div>
        <div className="relative z-10 w-24 h-24 mx-auto mb-8 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center backdrop-blur-sm">
          <ImageIcon className="w-10 h-10 text-slate-400" />
        </div>
        <h4 className="text-2xl font-bold font-[var(--font-display)] text-white mb-4 relative z-10">La galerie est en cours de création</h4>
        <p className="text-slate-400 text-lg relative z-10 max-w-lg mx-auto">Revenez bientôt pour découvrir les moments magiques capturés au Château du Mwana.</p>
      </div>
    );
  }

  return (
    <>
      <StaggerContainer className="masonry-grid">
        {items.map((item) => (
          <StaggerItem key={item.id} className="masonry-item">
            <button
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelectedImage(item);
              }}
              className="w-full text-left group relative rounded-3xl overflow-hidden bg-slate-200 shadow-[var(--shadow-public-card)] hover:shadow-[var(--shadow-public-hover)] transition-shadow cursor-zoom-in"
              aria-label={`Agrandir l'image ${item.title || ""}`}
            >
              <img 
                src={item.mediaUrl} 
                alt={item.title || "Souvenir du Château du Mwana"} 
                className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                {item.title && (
                  <h3 className="text-white font-bold text-lg font-[var(--font-display)] mb-1">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-white/80 text-sm line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {selectedImage && (
        <Lightbox
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.mediaUrl}
          altText={selectedImage.title || "Image en plein écran"}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
