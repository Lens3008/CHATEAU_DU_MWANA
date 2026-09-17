'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { href: '/', label: 'Accueil' },
  { href: '/presentation', label: 'Présentation' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Galerie' },
  { href: '/contact', label: 'Contact' },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 min-h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0 group" onClick={() => setIsOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Le Château du Mwana"
            width={160}
            height={60}
            className="w-32 sm:w-40 h-auto object-contain group-hover:scale-105 transition-transform"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 lg:gap-8 font-medium" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--color-public-primary)] transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/reserver" onClick={() => setIsOpen(false)}>
            <Button variant="public-primary" size="lg" className="whitespace-nowrap">
              Réserver
            </Button>
          </Link>
          <Link href="/login" className="hidden lg:inline-block text-sm text-[var(--color-public-text-muted)] hover:text-[var(--color-public-text)]">
            Connexion
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-public-text)] hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-public-primary)]"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            aria-controls="public-mobile-navigation"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav id="public-mobile-navigation" className="lg:hidden border-t border-slate-200 bg-white px-4 py-3" aria-label="Navigation mobile">
          <div className="container mx-auto flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 font-medium hover:bg-slate-50 hover:text-[var(--color-public-primary)]"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reserver"
              className="mt-2 rounded-lg bg-[var(--color-public-primary)] px-3 py-3 text-center font-semibold text-slate-900 hover:bg-[var(--color-public-primary-hover)]"
              onClick={() => setIsOpen(false)}
            >
              Réserver
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
