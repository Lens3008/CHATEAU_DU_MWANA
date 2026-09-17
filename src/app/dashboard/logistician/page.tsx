import { requireRole } from '@/lib/auth/user'
import { db } from '@/lib/prisma'
import Link from 'next/link'
import { 
  PackageSearch,
  Truck,
  Wrench,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Archive,
  Settings2
} from 'lucide-react'
import { EmptyLocations } from '@/components/ui/empty'

export const metadata = {
  title: 'Dashboard Logistician | Château du Mwana',
  description: 'Opérations logistiques',
}

export default async function LogisticianDashboard() {
  await requireRole(['LOGISTICIAN'])

  // Fetch logistics-specific data only
  const logisticsMissions = await db.orm.public.LogisticsMission.all()
  const equipments = await db.orm.public.Equipment.all()
  const inventories = await db.orm.public.Inventory.all()
  const maintenances = await db.orm.public.EquipmentMaintenance.all()
  const deliveries = await db.orm.public.Delivery.all()
  const allocations = await db.orm.public.InventoryAllocation.all()
  const storageLocations = await db.orm.public.StorageLocation.all()
  const allLocations = await db.orm.public.Location.all()

  // Calculate logistics KPIs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayMissions = logisticsMissions.filter((m: any) => {
    const createdDate = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt.epochMilliseconds || m.createdAt)
    return createdDate >= today && createdDate < tomorrow
  })

  const plannedMissions = logisticsMissions.filter((m: any) => 
    m.status === 'PLANIFIEE' || m.status === 'A_PLANIFIER'
  )
  const inPreparationMissions = logisticsMissions.filter((m: any) => m.status === 'EN_PREPARATION')
  const inProgressMissions = logisticsMissions.filter((m: any) => m.status === 'EN_COURS')
  const incidentMissions = logisticsMissions.filter((m: any) => m.status === 'INCIDENT')
  const completedMissions = logisticsMissions.filter((m: any) => m.status === 'TERMINEE')

  const criticalStock = equipments.filter((e: any) => {
    const eqInventories = inventories.filter((i: any) => i.equipmentId === e.id)
    const available = eqInventories.filter((i: any) => i.status === 'AVAILABLE').reduce((sum: number, i: any) => sum + i.quantity, 0)
    return available < e.minStockThreshold
  })

  const inUseEquipment = inventories.filter((i: any) => i.status === 'IN_USE').length
  const availableEquipment = inventories.filter((i: any) => i.status === 'AVAILABLE').length
  const inMaintenanceEquipment = inventories.filter((i: any) => i.status === 'IN_MAINTENANCE').length

  const pendingMaintenance = maintenances.filter((m: any) => m.status === 'IN_PROGRESS')
  const pendingDeliveries = deliveries.filter((d: any) => d.status === 'PENDING')
  const inTransitDeliveries = deliveries.filter((d: any) => d.status === 'IN_TRANSIT')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard Logistician
        </h1>
        <p className="text-slate-500 mt-1">
          Opérations logistiques du Château du Mwana
        </p>
      </div>

      {/* Incidents et Alertes - Priorité absolue */}
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

        {/* Missions en préparation - Priorité haute */}
        <div className={`p-6 rounded-2xl border shadow-sm ${inPreparationMissions.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">En Préparation</h3>
            <PackageSearch className={`w-5 h-5 ${inPreparationMissions.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${inPreparationMissions.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{inPreparationMissions.length}</p>
            <p className="text-sm text-slate-500 mt-1">équipements à rassembler</p>
          </div>
          <Link 
            href="/admin/logistics"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Préparer les missions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Livraisons en attente - Priorité haute */}
        <div className={`p-6 rounded-2xl border shadow-sm ${pendingDeliveries.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Livraisons en attente</h3>
            <Truck className={`w-5 h-5 ${pendingDeliveries.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-center py-2">
            <p className={`text-3xl font-bold ${pendingDeliveries.length > 0 ? 'text-blue-600' : 'text-slate-900'}`}>{pendingDeliveries.length}</p>
            <p className="text-sm text-slate-500 mt-1">à livrer</p>
          </div>
          <Link 
            href="/admin/logistics/allocations"
            className="mt-3 text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Gérer les livraisons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stock critique - Alertes actionnables */}
      <div className={`p-6 rounded-2xl border shadow-sm ${criticalStock.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Alertes Stock</h3>
          <AlertTriangle className={`w-5 h-5 ${criticalStock.length > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
        </div>
        {criticalStock.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
            <p>Stock suffisant pour tous les équipements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalStock.slice(0, 5).map((eq: any) => {
              const eqInventories = inventories.filter((i: any) => i.equipmentId === eq.id)
              const available = eqInventories.filter((i: any) => i.status === 'AVAILABLE').reduce((sum: number, i: any) => sum + i.quantity, 0)
              return (
                <div key={eq.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div>
                    <p className="font-medium text-slate-900">{eq.name}</p>
                    <p className="text-xs text-slate-500">Seuil: {eq.minStockThreshold} | Actuel: {available}</p>
                  </div>
                  <Link 
                    href="/admin/logistics/inventory"
                    className="text-sm font-medium text-orange-700 hover:text-orange-800"
                  >
                    Réapprovisionner
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Missions en cours */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Missions en cours</h3>
          <Truck className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{inProgressMissions.length}</p>
                <p className="text-xs text-slate-500">livraisons actives</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{inTransitDeliveries.length}</p>
                <p className="text-xs text-slate-500">en transit</p>
              </div>
            </div>
          </div>
        </div>
        <Link 
          href="/admin/logistics"
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Superviser les missions <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* État des équipements - Information secondaire */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">État des Équipements</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{availableEquipment}</p>
                <p className="text-xs text-slate-500">Disponibles</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{inUseEquipment}</p>
                <p className="text-xs text-slate-500">En usage</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xl font-bold text-slate-900">{inMaintenanceEquipment}</p>
                <p className="text-xs text-slate-500">En maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance */}
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

      {/* Emplacements de stockage */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Emplacements de Stockage</h3>
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
        {storageLocations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucun emplacement de stockage configuré</p>
          </div>
        ) : (
          <div className="space-y-3">
            {storageLocations.slice(0, 5).map((loc: any) => (
              <div key={loc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{loc.name}</p>
                  <p className="text-xs text-slate-500">{loc.type || 'Dépôt'}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {loc.capacity ? `Capacité: ${loc.capacity}` : 'Actif'}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link 
          href="/admin/logistics/locations"
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Gérer les emplacements <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
