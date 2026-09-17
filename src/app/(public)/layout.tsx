import Image from 'next/image';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/PublicHeader';
import { getSetting } from '@/lib/services/settings';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Try to load basic settings
  let siteName = 'Le Château du Mwana';
  try {
    const s = await getSetting('site_name');
    if (s?.value) siteName = s.value;
  } catch (e) {
    // ignore
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-public-bg)] text-[var(--color-public-text)] font-[var(--font-sans)] selection:bg-[var(--color-public-primary)] selection:text-white">
      <PublicHeader />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--color-public-text)] text-white/80 py-16 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/images/logo.png" 
                alt="Le Château du Mwana" 
                width={140} 
                height={50} 
                className="object-contain" 
              />
            </div>
            <p className="text-sm">
              Plus qu'un espace de jeux, c'est une aventure ! Des moments inoubliables en famille ou entre amis.
            </p>
          </div>
          <div>
            <h4 className="font-[var(--font-display)] font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm break-words">
              <li><Link href="/" className="hover:text-[var(--color-public-primary)]">Accueil</Link></li>
              <li><Link href="/services" className="hover:text-[var(--color-public-primary)]">Formules</Link></li>
              <li><Link href="/gallery" className="hover:text-[var(--color-public-primary)]">Galerie</Link></li>
              <li><Link href="/reserver" className="hover:text-[var(--color-public-primary)]">Réserver</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-[var(--font-display)] font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-[var(--color-public-primary)]">Nous contacter</Link></li>
              <li><Link href="/page/mentions-legales" className="hover:text-[var(--color-public-primary)]">Mentions légales</Link></li>
              <li><Link href="/page/cgv" className="hover:text-[var(--color-public-primary)]">CGV</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-[var(--font-display)] font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm break-words">
              <li>Libreville, Gabon</li>
              <li>contact@chateaudumwana.com</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-sm text-center text-white/50">
          © {new Date().getFullYear()} {siteName}. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
