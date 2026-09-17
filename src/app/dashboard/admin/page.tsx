import { requireRole } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  DollarSign, 
  PackageSearch,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Wrench
} from 'lucide-react'
import { EmptyNotifications } from '@/components/ui/empty'
import { CardSkeleton } from '@/components/ui/loading'

export const metadata = {
  title: 'Dashboard Admin | Château du Mwana',
  description: 'Vue globale et contrôle total',
}

export default async function AdminDashboard() {
  await requireRole(['ADMIN'])

  // Fetch real data from the database
  const reservations = await db.orm.public.Reservation.all()
  const customers = await db.orm.public.Customer.all()
  const users = await db.orm.public.User.all()
  const equipments = await db.orm.public.Equipment.all()
  const inventories = await db.orm.public.Inventory.all()
  const logisticsMissions = await db.orm.public.LogisticsMission.all()
  const maintenances = await db.orm.public.EquipmentMaintenance.all()

  // Calculate real KPIs
  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter((r: any) => r.status === 'CONFIRMED').length
  const completedReservations = reservations.filter((r: any) => r.status === 'COMPLETED').length
  const totalRevenue = reservations
    .filter((r: any) => r.status !== 'CANCELLED')
    .reduce((sum: number, r: any) => sum + Number(r.totalAmount), 0)
  
  const activeCustomers = new Set(
    reservations
      .filter((r: any) => r.status !== 'CANCELLED')
      .map((r: any) => r.customerId)
  ).size

  const teamMembers = users.filter((u: any) => 
    ['ADMIN', 'SUPERVISOR', 'SECRETARY', 'LOGISTICIAN'].includes(u.role)
  ).length

  const inUseEquipment = inventories.filter((i: any) => i.status === 'IN_USE').length
  const activeMissions = logisticsMissions.filter((m: any) => 
    ['EN_PREPARATION', 'EN_COURS'].includes(m.status)
  ).length
  const pendingMaintenance = maintenances.filter((m: any) => m.status === 'IN_PROGRESS').length
  const incidentMissions = logisticsMissions.filter((m: any) => m.status === 'INCIDENT').length

  const criticalStock = equipments.filter((e: any) => {
    const eqInventories = inventories.filter((i: any) => i.equipmentId === e.id)
    const available = eqInventories.filter((i: any) => i.status === 'AVAILABLE').reduce((sum: number, i: any) => sum + i.quantity, 0)
    return available < e.minStockThreshold
  }).length

  // Recent activity
  const recentReservations = [...reservations]
    .sort((a: any, b: any) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt.epochMilliseconds || a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt.epochMilliseconds || b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard Admin
        </h1>
        <p className="text-slate-500 mt-1">
          Vue globale et contrôle total du Château du Mwana
        </p>
      </div>

      {/* Situation du Jour - KPI essentiels sans redondance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Situation du Jour</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{totalRevenue > 0 ? totalRevenue.toLocaleString('fr-FR') : '0'} FCFA</p>
                <p className="text-xs text-slate-500">Chiffre d'affaires</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{confirmedReservations}</p>
                <p className="text-xs text-slate-500">Réservations confirmées</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{activeCustomers}</p>
                <p className="text-xs text-slate-500">Clients actifs</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <PackageSearch className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{activeMissions}</p>
                <p className="text-xs text-slate-500">Missions actives</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et Problèmes - Zone de triage */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Incidents - Priorité absolue */}
        <div className={`p-6 rounded-2xl border shadow-sm ${incidentMissions > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Incidents</h3>
            <AlertTriangle className={`w-5 h-5 ${incidentMissions > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${incidentMissions > 0 ? 'text-red-600' : 'text-slate-900'}`}>{incidentMissions}</p>
            <p className="text-sm text-slate-500 mt-1">requièrent une intervention</p>
          </div>
          <Link 
            href="/admin/logistics"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Traiter les incidents <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Maintenances en cours */}
        <div className={`p-6 rounded-2xl border shadow-sm ${pendingMaintenance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Maintenances</h3>
            <Wrench className={`w-5 h-5 ${pendingMaintenance > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${pendingMaintenance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingMaintenance}</p>
            <p className="text-sm text-slate-500 mt-1">en cours</p>
          </div>
          <Link 
            href="/admin/logistics/maintenance"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Voir les maintenances <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stock critique */}
        <div className={`p-6 rounded-2xl border shadow-sm ${criticalStock > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Stock Critique</h3>
            <PackageSearch className={`w-5 h-5 ${criticalStock > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${criticalStock > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{criticalStock}</p>
            <p className="text-sm text-slate-500 mt-1">équipements sous le seuil</p>
          </div>
          <Link 
            href="/admin/logistics/inventory"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Réapprovisionner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Actions principales - CTA explicites */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Actions Principales</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mobile-cta-stack">
          <Link 
            href="/admin/reservations"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Gérer les réservations</span>
          </Link>
          <Link 
            href="/admin/crm"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Consulter le CRM</span>
          </Link>
          <Link 
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Analyser la performance</span>
          </Link>
          <Link 
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-chateau-gold)] transition-colors"
          >
            <Settings className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">Gérer l'équipe</span>
          </Link>
        </div>
      </div>

      {/* Activité récente - Information secondaire */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Activité Récente</h3>
        {recentReservations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aucune activité récente
          </div>
        ) : (
          <div className="space-y-3">
            {recentReservations.map((res: any) => {
              const date = res.createdAt instanceof Date ? res.createdAt : new Date(res.createdAt.epochMilliseconds || res.createdAt)
              return (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{res.reference}</p>
                      <p className="text-xs text-slate-500">
                        {date.toLocaleDateString('fr-FR')} • {res.status}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {Number(res.totalAmount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
