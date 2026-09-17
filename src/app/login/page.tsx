import { login } from './actions'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-public-bg)] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.05)_0%,transparent_50%)]"></div>
      
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-slate-900 p-10 shadow-[var(--shadow-public-hover)] border border-slate-800 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/images/logo.png" 
              alt="Le Château du Mwana" 
              width={160} 
              height={60} 
              className="object-contain" 
              priority
            />
          </div>
          <h2 className="text-3xl font-bold font-[var(--font-display)] tracking-tight text-white mb-2">
            Portail Mwana
          </h2>
          <p className="text-sm text-slate-400">
            Connexion au back-office et à l'espace client
          </p>
        </div>
        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-xl border-0 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--color-public-primary)] sm:text-sm sm:leading-6 transition-all"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-xl border-0 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--color-public-primary)] sm:text-sm sm:leading-6 transition-all"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
              <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-[var(--color-public-primary)] px-3 py-3.5 text-sm font-bold text-slate-900 hover:bg-[var(--color-public-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-public-primary)] transition-all shadow-md"
            >
              Se connecter
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-slate-400">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-bold text-[var(--color-public-primary)] hover:text-yellow-400 transition-colors">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}
