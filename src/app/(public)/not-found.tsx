import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-6xl font-bold font-[var(--font-display)] text-[var(--color-public-primary)] mb-6">404</h2>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Page introuvable</h3>
      <p className="text-slate-500 max-w-md mb-8">
        La page que vous cherchez a peut-être été déplacée ou n'existe plus. Pas d'inquiétude, la magie continue ailleurs !
      </p>
      <Link href="/">
        <Button variant="public-primary" size="lg">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
}
