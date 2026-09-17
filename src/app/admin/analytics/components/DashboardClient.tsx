'use client'

import { useState } from 'react';
import { PeriodFilter } from '@/lib/services/analytics/date-utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Package, AlertTriangle, CheckCircle, 
  DollarSign, ShoppingCart, Calendar, ArrowRight, RefreshCw, Activity 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardClient({ initialData, initialPeriod }: { initialData: any, initialPeriod: PeriodFilter }) {
  const [period, setPeriod] = useState<PeriodFilter>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const handlePeriodChange = async (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
    setIsLoading(true);
    // In a real app we could fetch via Server Action or API route here.
    // Since we're using Next.js App Router, we can also just update searchParams to trigger a server re-render.
    window.location.href = `/admin/analytics?period=${newPeriod}`;
  };

  const { role, reservations, topFormulas, customers, finance, logistics } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const statusData = [
    { name: 'Confirmées', value: reservations.confirmedCount },
    { name: 'Complétées', value: reservations.completedCount },
    { name: 'Annulées', value: reservations.cancelledCount },
    { name: 'Brouillons', value: reservations.draftCount },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            Pilotage & Reporting
          </h1>
          <p className="text-sm text-slate-500">Vue synthétique de l'activité du Château du Mwana</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7d', label: '7 jours' },
            { id: '30d', label: '30 jours' },
            { id: 'this_month', label: 'Ce mois' },
            { id: 'this_year', label: 'Cette année' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id as PeriodFilter)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                period === p.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Finance KPIs (Admin/Supervisor/Secretary) */}
          {finance && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-indigo-100 text-sm font-medium mb-1 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Chiffre d'Affaires
                  </p>
                  <h3 className="text-3xl font-bold">{formatCurrency(finance.totalRevenue)}</h3>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                  <DollarSign className="h-32 w-32" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Encaissements
                </p>
                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(finance.totalCollected)}</h3>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Reste à payer
                </p>
                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(finance.totalPending)}</h3>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                  <RefreshCw className="h-4 w-4 text-rose-500" /> Remboursements
                </p>
                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(finance.totalRefunded)}</h3>
                <p className="text-xs text-slate-400 mt-1">{finance.refundsCount} opération(s)</p>
              </div>
            </div>
          )}

          {/* Business & Logistics Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Commercial */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Activité Commerciale
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Réservations validées</p>
                    <p className="text-2xl font-bold text-slate-800">{reservations.confirmedCount + reservations.completedCount}</p>
                    <p className="text-xs text-slate-400 mt-1">sur {reservations.totalReservations} au total</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Panier Moyen</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(reservations.averageCart)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Nouveaux Clients</p>
                    <p className="text-2xl font-bold text-slate-800">{customers.newCustomers}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Clients Fidèles</p>
                    <p className="text-2xl font-bold text-slate-800">{customers.returningCustomers}</p>
                  </div>
                </div>
              </div>

              {/* Status Chart */}
              {statusData.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition des Réservations</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Logistics & Top Products */}
            <div className="space-y-6">
              
              {/* Logistics KPIs (Admin/Supervisor/Logistician) */}
              {logistics && logistics.inventory && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-500" />
                    Opérations & Logistique
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-between">
                      <p className="text-sm text-slate-500">Matériel Actif</p>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-bold text-slate-800">{logistics.inventory.availableQuantity + logistics.inventory.inUseQuantity}</p>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{logistics.inventory.totalEquipments} ref</span>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg flex flex-col justify-between ${logistics.inventory.criticalStockCount > 0 ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50'}`}>
                      <p className="text-sm text-slate-500">Alertes Stock Critique</p>
                      <p className={`text-2xl font-bold mt-2 ${logistics.inventory.criticalStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {logistics.inventory.criticalStockCount}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-500">En Maintenance</p>
                      <p className="text-xl font-bold text-slate-800 mt-2">{logistics.inventory.inMaintenanceQuantity}</p>
                    </div>

                    {logistics.missions && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Missions Prévues</p>
                        <p className="text-xl font-bold text-slate-800 mt-2">{logistics.missions.planned + logistics.missions.inProgress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Products */}
              {topFormulas.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-amber-500" />
                    Top Prestations
                  </h3>
                  <div className="space-y-4">
                    {topFormulas.map((f: any, idx: number) => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-white font-bold text-slate-500 shadow-sm text-sm">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{f.name}</p>
                            <p className="text-xs text-slate-500">{f.reservationsCount} ventes • {f.participantsCount} participants</p>
                          </div>
                        </div>
                        {finance && (
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{formatCurrency(f.revenue)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}
