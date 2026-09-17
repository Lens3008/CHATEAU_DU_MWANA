import { getCurrentUser } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarDays, 
  DollarSign,
  Gift,
  Bell,
  User,
  CreditCard,
  FileText,
  ArrowRight,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'

export const metadata = {
  title: 'Mon Espace | Château du Mwana',
  description: 'Espace personnel client',
}

export default async function ClientDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // CLIENT can only see their own data
  if (user.role !== 'CLIENT') {
    redirect('/dashboard')
  }

  const customerId = user.customerId
  if (!customerId) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-500">Profil client non configuré. Veuillez contacter l'administration.</p>
        </div>
      </div>
    )
  }

  // Fetch client's personal data only using DB isolation
  const allCustomers = await db.orm.public.Customer.where({ id: customerId }).all()
  const customer = allCustomers[0]

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-500">Profil client non trouvé. Veuillez contacter l'administration.</p>
        </div>
      </div>
    )
  }

  const customerReservations = await db.orm.public.Reservation.where({ customerId }).all()
  const customerInvoices = await db.orm.public.Invoice.where({ customerId }).all()
  
  const allLoyaltyAccounts = await db.orm.public.LoyaltyAccount.where({ customerId }).all()
  const loyaltyAccount = allLoyaltyAccounts[0]
  
  const loyaltyTransactions = loyaltyAccount 
    ? await db.orm.public.LoyaltyTransaction.where({ accountId: loyaltyAccount.id }).all()
    : []

  // Calculate personal KPIs
  const upcomingReservations = customerReservations.filter((r: any) => {
    const startDate = r.startDate instanceof Date ? r.startDate : new Date(r.startDate.epochMilliseconds || r.startDate)
    return startDate >= new Date() && r.status !== 'CANCELLED'
  }).sort((a: any, b: any) => {
    const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate.epochMilliseconds || a.startDate)
    const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate.epochMilliseconds || b.startDate)
    return dateA.getTime() - dateB.getTime()
  })

  const nextReservation = upcomingReservations[0]

  const pastReservations = customerReservations.filter((r: any) => {
    const startDate = r.startDate instanceof Date ? r.startDate : new Date(r.startDate.epochMilliseconds || r.startDate)
    return startDate < new Date() || r.status === 'COMPLETED' || r.status === 'CANCELLED'
  })

  const totalSpent = customerReservations
    .filter((r: any) => r.status !== 'CANCELLED')
    .reduce((sum: number, r: any) => sum + Number(r.totalAmount), 0)

  const pendingInvoices = customerInvoices.filter((i: any) => i.status === 'PENDING')
  const paidInvoices = customerInvoices.filter((i: any) => i.status === 'PAID')

  const currentPoints = loyaltyAccount?.currentPoints || 0
  const recentTransactions = loyaltyTransactions
    .sort((a: any, b: any) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date.epochMilliseconds || a.date)
      const dateB = b.date instanceof Date ? b.date : new Date(b.date.epochMilliseconds || b.date)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Bonjour, {user.name || customer?.firstName || 'Client'}
        </h1>
        <p className="text-slate-500 mt-1">
          Bienvenue sur votre espace personnel du Château du Mwana
        </p>
      </div>

      {/* Prochaine Réservation - Point central */}
      {nextReservation ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Votre Prochaine Réservation</h2>
            <CalendarDays className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-slate-900">{nextReservation.reference}</p>
                <p className="text-sm text-slate-500">
                  {nextReservation.startDate instanceof Date ? nextReservation.startDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : new Date(nextReservation.startDate.epochMilliseconds || nextReservation.startDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                nextReservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                nextReservation.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {nextReservation.status === 'CONFIRMED' ? 'Confirmée' : 
                 nextReservation.status === 'DRAFT' ? 'En attente' : nextReservation.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-200">
              <p className="text-sm text-slate-600">
                Montant: {Number(nextReservation.totalAmount).toLocaleString('fr-FR')} FCFA
              </p>
              <Link 
                href={`/dashboard/reservations`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Voir les détails <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-4">Vous n'avez aucune réservation à venir</p>
            <Link 
              href="/reserver"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Réserver maintenant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Paiements en attente - Actionnable */}
      {pendingInvoices.length > 0 && (
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Paiements en attente</h2>
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-3">
            {pendingInvoices.slice(0, 3).map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-200">
                <div>
                  <p className="font-medium text-slate-900">{invoice.invoiceNumber || `Facture #${invoice.id}`}</p>
                  <p className="text-xs text-slate-500">
                    {invoice.createdAt instanceof Date ? invoice.createdAt.toLocaleDateString('fr-FR') : new Date(invoice.createdAt.epochMilliseconds || invoice.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {Number(invoice.totalAmount).toLocaleString('fr-FR')} FCFA
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    En attente
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/dashboard/reservations"
            className="mt-4 text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Gérer les paiements <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI secondaires */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-slate-900">{currentPoints}</p>
              <p className="text-xs text-slate-500">Points fidélité</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xl font-bold text-slate-900">
                {totalSpent > 0 ? totalSpent.toLocaleString('fr-FR') : '0'} FCFA
              </p>
              <p className="text-xs text-slate-500">Total dépensé</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xl font-bold text-slate-900">{pastReservations.length}</p>
              <p className="text-xs text-slate-500">Réservations passées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions principales près du contexte */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Actions Principales</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mobile-cta-stack">
          <Link 
            href="/reserver"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Nouvelle Réservation</span>
          </Link>
          <Link 
            href="/dashboard/reservations"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Mes Réservations</span>
          </Link>
          <Link 
            href="/contact"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <Bell className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Nous Contacter</span>
          </Link>
          <Link 
            href="/dashboard/client"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <User className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Mon Profil</span>
          </Link>
        </div>
      </div>

      {/* Programme Fidélité - Information secondaire */}
      {loyaltyAccount && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Programme Fidélité</h3>
            <Gift className="w-5 h-5 text-slate-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{currentPoints}</p>
              <p className="text-sm text-slate-500">Points disponibles</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{loyaltyAccount.totalPointsEarned}</p>
              <p className="text-sm text-slate-500">Points gagnés total</p>
            </div>
          </div>
          {recentTransactions.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50">
              <p className="text-sm font-medium mb-2">Activité récente</p>
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map((tx: any) => (
                  <div key={tx.id} className="flex justify-between text-sm">
                    <span>{tx.type === 'EARN' ? 'Points gagnés' : 'Points utilisés'}</span>
                    <span className={tx.type === 'EARN' ? 'text-green-600' : 'text-amber-600'}>
                      {tx.type === 'EARN' ? '+' : '-'}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
