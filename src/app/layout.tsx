import './globals.css'
import { Inter, Quicksand } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' })

export const metadata = {
  title: 'Le Château du Mwana',
  description: 'Un univers magique pour les enfants, une parenthèse de bonheur pour toute la famille.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${quicksand.variable}`}>
      <body className={`${inter.className} bg-[var(--color-admin-bg)] sm:bg-white text-slate-900`}>
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:ring-2 focus:ring-white"
        >
          Passer au contenu principal
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
