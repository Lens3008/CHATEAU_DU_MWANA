import { requireRole } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import Link from 'next/link'
import { 
  CalendarDays, 
  PackageSearch,
  Truck,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Users,
  Settings2
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard Supervisor | Château du Mwana',
  description: 'Supervision opérationnelle',
}

export default async function SupervisorDashboard() {
  await requireRole(['SUPERVISOR'])

  // Fetch operational data
  const reservations = await db.orm.public.Reservation.all()
  const logisticsMissions = await db.orm.public.LogisticsMission.all()
  const equipments = await db.orm.public.Equipment.all()
  const inventories = await db.orm.public.Inventory.all()
  const maintenances = await db.orm.public.EquipmentMaintenance.all()
  const deliveries = await db.orm.public.Delivery.all()
  const allUsers = await db.orm.public.User.all()

  // Calculate operational KPIs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayReservations = reservations.filter((r: any) => {
    const startDate = r.startDate instanceof Date ? r.startDate : new Date(r.startDate.epochMilliseconds || r.startDate)
    return startDate >= today && startDate < tomorrow
  })

  const upcomingReservations = reservations.filter((r: any) => {
    const startDate = r.startDate instanceof Date ? r.startDate : new Date(r.startDate.epochMilliseconds || r.startDate)
    return startDate >= tomorrow && startDate < new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000)
  })

  const plannedMissions = logisticsMissions.filter((m: any) => m.status === 'PLANIFIEE' || m.status === 'A_PLANIFIER')
  const inProgressMissions = logisticsMissions.filter((m: any) => ['EN_PREPARATION', 'EN_COURS'].includes(m.status))
  const incidentMissions = logisticsMissions.filter((m: any) => m.status === 'INCIDENT')

  const criticalStock = equipments.filter((e: any) => {
    const eqInventories = inventories.filter((i: any) => i.equipmentId === e.id)
    const available = eqInventories.filter((i: any) => i.status === 'AVAILABLE').reduce((sum: number, i: any) => sum + i.quantity, 0)
    return available < e.minStockThreshold
  }).length

  const pendingMaintenance = maintenances.filter((m: any) => m.status === 'IN_PROGRESS')
  const pendingDeliveries = deliveries.filter((d: any) => d.status === 'PENDING')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard Supervisor
        </h1>
        <p className="text-slate-500 mt-1">
          Supervision opérationnelle du Château du Mwana
        </p>
      </div>

      {/* Alertes et Incidents - Priorité absolue */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Incidents - Priorité maximale */}
        <div className={`p-6 rounded-2xl border shadow-sm ${incidentMissions.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Incidents</h3>
            <AlertTriangle className={`w-5 h-5 ${incidentMissions.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${incidentMissions.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{incidentMissions.length}</p>
            <p className="text-sm text-slate-500 mt-1">requièrent une intervention</p>
          </div>
          <Link 
            href="/admin/logistics"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Traiter les incidents <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Missions en cours */}
        <div className={`p-6 rounded-2xl border shadow-sm ${inProgressMissions.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Missions en cours</h3>
            <Truck className={`w-5 h-5 ${inProgressMissions.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${inProgressMissions.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{inProgressMissions.length}</p>
            <p className="text-sm text-slate-500 mt-1">opérations actives</p>
          </div>
          <Link 
            href="/admin/logistics"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Superviser les missions <ArrowRight className="w-4 h-4" />
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

      {/* Opérations du Jour - KPI essentiels */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Opérations du Jour</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{todayReservations.length}</p>
                <p className="text-xs text-slate-500">Réservations aujourd'hui</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{pendingDeliveries.length}</p>
                <p className="text-xs text-slate-500">Livraisons en attente</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{pendingMaintenance.length}</p>
                <p className="text-xs text-slate-500">Maintenances en cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Réservations à venir et Maintenance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Réservations à venir (7 jours)</h3>
            <CalendarDays className="w-5 h-5 text-slate-400" />
          </div>
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucune réservation à venir
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.slice(0, 5).map((res: any) => {
                const date = res.startDate instanceof Date ? res.startDate : new Date(res.startDate.epochMilliseconds || res.startDate)
                return (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{res.reference}</p>
                      <p className="text-xs text-slate-500">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <Link 
            href="/admin/reservations"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Voir toutes les réservations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Maintenance</h3>
            <Wrench className="w-5 h-5 text-slate-400" />
          </div>
          {pendingMaintenance.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucune maintenance en cours
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMaintenance.slice(0, 5).map((maint: any) => (
                <div key={maint.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">Équipement #{maint.equipmentId}</p>
                    <p className="text-xs text-slate-500">{maint.description || 'Maintenance en cours'}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    En cours
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link 
            href="/admin/logistics/maintenance"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Gérer la maintenance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Équipe - Information secondaire, réduite */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Équipe Opérationnelle</h3>
          <Users className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mobile-stack-grid">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xl font-bold text-slate-900">{allUsers.filter((u: any) => u.isActive).length}</p>
                <p className="text-xs text-slate-500">Équipe active</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xl font-bold text-slate-900">{allUsers.filter((u: any) => u.role === 'LOGISTICIAN').length}</p>
                <p className="text-xs text-slate-500">Logisticiens</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xl font-bold text-slate-900">{allUsers.filter((u: any) => u.role === 'SUPERVISOR').length}</p>
                <p className="text-xs text-slate-500">Superviseurs</p>
              </div>
            </div>
          </div>
        </div>
        <Link 
          href="/admin/users"
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Gérer l'équipe <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
