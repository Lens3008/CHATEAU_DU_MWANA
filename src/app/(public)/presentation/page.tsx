import { FadeIn } from "@/components/public/MotionWrapper";
import { ChateauLine } from "@/components/public/ChateauLine";

export const metadata = {
  title: "Présentation | Le Château du Mwana",
  description: "Découvrez notre histoire et notre mission pour émerveiller les enfants.",
};

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-24">
      {/* Hero Header */}
      <div className="bg-[var(--color-public-primary)] py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-4">Notre Magie</h1>
            <div className="mb-6">
              <ChateauLine variant="accent" delay={0.1} />
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Un espace pensé par et pour les familles, dédié à l'émerveillement.</p>
          </FadeIn>
        </div>
      </div>

      {/* Ligne architecturale de transition */}
      <div className="bg-[var(--color-public-primary)]">
        <ChateauLine variant="horizon" />
      </div>

      <div className="container mx-auto px-4 mt-12">
        <FadeIn delay={0.2} className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-[var(--shadow-public-card)] text-slate-700 leading-relaxed text-lg space-y-6">
          <p>
            Bienvenue au <strong>Château du Mwana</strong>, le royaume enchanteur dédié au bonheur des enfants et à la tranquillité des parents. Situé au cœur de Libreville, notre complexe de jeux est le lieu idéal pour toutes vos célébrations et moments en famille.
          </p>
          <p>
            Nous croyons fermement que le jeu est essentiel au développement de l'enfant. C'est pourquoi chaque espace, chaque attraction et chaque formule que nous concevons a pour but de stimuler l'imagination, d'encourager le partage et de garantir une sécurité absolue.
          </p>
          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-yellow-50 p-6 rounded-2xl border-l-4 border-[var(--color-public-primary)]">
              <h3 className="font-bold text-[var(--color-public-primary)] text-xl font-[var(--font-display)] mb-3">Notre Mission</h3>
              <p className="text-base">Offrir une parenthèse de joie inégalée pour les familles, en alliant divertissement ludique et services premium dans un cadre sécurisé.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-400">
              <h3 className="font-bold text-blue-500 text-xl font-[var(--font-display)] mb-3">Notre Vision</h3>
              <p className="text-base">Devenir la référence absolue en matière de loisirs pour enfants et d'organisation d'événements familiaux en Afrique centrale.</p>
            </div>
          </div>
          <p>
            Que ce soit pour un anniversaire inoubliable, une sortie de fin d'année, ou un dimanche de détente, notre équipe d'animation passionnée veille à ce que chaque visite se transforme en souvenir impérissable.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
