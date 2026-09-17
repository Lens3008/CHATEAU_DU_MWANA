import { requireRole } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import Link from 'next/link'
import { 
  CalendarDays, 
  Users,
  FileText,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  Building
} from 'lucide-react'
import { EmptyMessages } from '@/components/ui/empty'

export const metadata = {
  title: 'Dashboard Secretary | Château du Mwana',
  description: 'Gestion administrative et commerciale',
}

export default async function SecretaryDashboard() {
  await requireRole(['SECRETARY'])

  // Fetch administrative/commercial data
  const reservations = await db.orm.public.Reservation.all()
  const customers = await db.orm.public.Customer.all()
  const invoices = await db.orm.public.Invoice.all()
  const contactMessages = await db.orm.public.ContactMessage.all()
  const services = await db.orm.public.Service.all()
  const formulas = await db.orm.public.Formula.all()

  // Calculate administrative KPIs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayReservations = reservations.filter((r: any) => {
    const startDate = r.startDate instanceof Date ? r.startDate : new Date(r.startDate.epochMilliseconds || r.startDate)
    return startDate >= today && startDate < tomorrow
  })

  const newReservations = reservations.filter((r: any) => r.status === 'DRAFT')
  const confirmedReservations = reservations.filter((r: any) => r.status === 'CONFIRMED')
  
  const unreadMessages = contactMessages.filter((m: any) => m.status === 'NEW')
  const pendingInvoices = invoices.filter((i: any) => i.status === 'PENDING')

  const totalRevenue = reservations
    .filter((r: any) => r.status !== 'CANCELLED')
    .reduce((sum: number, r: any) => sum + Number(r.totalAmount), 0)

  const newCustomers = customers.filter((c: any) => {
    const createdDate = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt.epochMilliseconds || c.createdAt)
    return createdDate >= today
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard Secretary
        </h1>
        <p className="text-slate-500 mt-1">
          Gestion administrative et commerciale
        </p>
      </div>

      {/* Priorités du Jour - Unifié avec séquence de traitement */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Priorités du Jour</h2>
        <div className="space-y-4">
          {/* Étape 1: Messages - Priorité maximale */}
          <div className={`p-4 rounded-lg border ${unreadMessages.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-bold text-sm">1</div>
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${unreadMessages.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-900">Messages non lus</p>
                    <p className="text-xs text-slate-500">à traiter en priorité</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${unreadMessages.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{unreadMessages.length}</span>
                <Link 
                  href="/admin/contact"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Traiter <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </div>
          </div>

          {/* Étape 2: Réservations - Priorité secondaire */}
          <div className={`p-4 rounded-lg border ${newReservations.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">2</div>
                <div className="flex items-center gap-3">
                  <CalendarDays className={`w-5 h-5 ${newReservations.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-900">Nouvelles réservations</p>
                    <p className="text-xs text-slate-500">à confirmer</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${newReservations.length > 0 ? 'text-blue-600' : 'text-slate-900'}`}>{newReservations.length}</span>
                <Link 
                  href="/admin/reservations"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Confirmer <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </div>
          </div>

          {/* Étape 3: Factures - Priorité tertiaire */}
          <div className={`p-4 rounded-lg border ${pendingInvoices.length > 0 ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">3</div>
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${pendingInvoices.length > 0 ? 'text-purple-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-900">Factures en attente</p>
                    <p className="text-xs text-slate-500">à envoyer</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${pendingInvoices.length > 0 ? 'text-purple-600' : 'text-slate-900'}`}>{pendingInvoices.length}</span>
                <Link 
                  href="/admin/analytics"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Consulter <ArrowRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Situation du Jour - KPI secondaires */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Situation du Jour</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{todayReservations.length}</p>
                <p className="text-xs text-slate-500">Réservations aujourd'hui</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{confirmedReservations.length}</p>
                <p className="text-xs text-slate-500">Confirmées</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{newCustomers}</p>
                <p className="text-xs text-slate-500">Nouveaux clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Catalogue</h3>
            <Building className="w-5 h-5 text-slate-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{services.length}</p>
              <p className="text-sm text-slate-500">Services</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{formulas.length}</p>
              <p className="text-sm text-slate-500">Formules</p>
            </div>
          </div>
          <Link 
            href="/admin/catalogue"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Gérer le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Chiffre d'affaires</h3>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-slate-900">
              {totalRevenue > 0 ? totalRevenue.toLocaleString('fr-FR') : '0'} FCFA
            </p>
            <p className="text-sm text-slate-500 mt-1">Total réservations</p>
          </div>
          <Link 
            href="/admin/analytics"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Analyser la performance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Messages récents - Information secondaire */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Messages Récents</h3>
          <Phone className="w-5 h-5 text-slate-400" />
        </div>
        {unreadMessages.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aucun message non lu
          </div>
        ) : (
          <div className="space-y-3">
            {unreadMessages.slice(0, 5).map((msg: any) => (
              <div key={msg.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{msg.name}</p>
                  <p className="text-xs text-slate-500">{msg.email}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Nouveau
                </span>
              </div>
            ))}
          </div>
        )}
        <Link 
          href="/admin/contact"
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Voir tous les messages <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
