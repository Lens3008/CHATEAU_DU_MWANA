// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getCustomer360Action } from '@/lib/actions/crm-actions';
import { getCustomerLoyaltySummaryAction } from '@/lib/actions/loyalty-actions';
import Link from 'next/link';

export const metadata = {
  title: 'Fiche Client 360° | Le Château du Mwana',
};

export default async function Customer360Page({ params }: { params: { id: string } }) {
  const user = await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);

  const crmData = await getCustomer360Action(params.id);
  const loyaltyData = await getCustomerLoyaltySummaryAction(params.id);

  const { customer, kpi, timeline } = crmData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/crm" className="text-indigo-600 hover:underline text-sm mb-2 inline-block">
            &larr; Retour au CRM
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-slate-500">ID: {customer.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Modifier Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne Gauche: Infos & Fidélité */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Coordonnées</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-sm block">Email</span>
                <span className="font-medium text-slate-800">{customer.email || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm block">Téléphone</span>
                <span className="font-medium text-slate-800">{customer.phone || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm block">Client depuis</span>
                <span className="font-medium text-slate-800">
                  {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-xl shadow-sm text-white">
            <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
              Programme Fidélité
              <span className="text-xs bg-indigo-500/30 px-2 py-1 rounded-full border border-indigo-400/30">
                {loyaltyData.level?.name || 'Découverte'}
              </span>
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-indigo-200 text-sm block">Solde de points</span>
                <span className="text-4xl font-bold">{loyaltyData.account?.currentPoints || 0} <span className="text-lg font-normal text-indigo-300">pts</span></span>
              </div>
              <div className="pt-4 border-t border-indigo-700/50">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-indigo-200">Total cumulé</span>
                  <span className="font-medium">{loyaltyData.account?.totalPointsEarned || 0} pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Notes CRM</h2>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">
              {customer.notes || "Aucune note pour ce client."}
            </p>
          </div>
        </div>

        {/* Colonne Droite: KPI & Historique */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-1">Réservations</span>
              <span className="text-2xl font-bold text-slate-800">{kpi.totalReservations}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-1">Dépense Totale</span>
              <span className="text-2xl font-bold text-emerald-600">{kpi.totalSpent.toLocaleString()} <span className="text-sm">FCFA</span></span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-1">Panier Moyen</span>
              <span className="text-2xl font-bold text-indigo-600">{Math.round(kpi.averageCart).toLocaleString()} <span className="text-sm">FCFA</span></span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-1">Annulations</span>
              <span className="text-2xl font-bold text-rose-600">{Math.round(kpi.cancellationRate)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Historique complet (Timeline 360)</h2>
            </div>
            <div className="p-6">
              {timeline.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucun événement enregistré.</p>
              ) : (
                <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
                  {timeline.map((event: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                        event.type === 'RESERVATION' ? 'bg-indigo-500' :
                        event.type === 'PAYMENT' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      }`}></div>
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-1">
                          {event.date.toLocaleString('fr-FR')}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                          {event.type === 'RESERVATION' && (
                            <div>
                              <span className="font-semibold text-slate-800 block mb-1">Nouvelle Réservation {event.data.reference}</span>
                              <span className="text-sm text-slate-600">Montant: {event.data.totalAmount} FCFA - Statut: {event.data.status}</span>
                            </div>
                          )}
                          {event.type === 'PAYMENT' && (
                            <div>
                              <span className="font-semibold text-emerald-700 block mb-1">Paiement effectué</span>
                              <span className="text-sm text-slate-600">Montant: {event.data.amount} FCFA - Statut: {event.data.status}</span>
                            </div>
                          )}
                          {event.type === 'INVOICE' && (
                            <div>
                              <span className="font-semibold text-amber-700 block mb-1">Facture générée {event.data.invoiceNumber}</span>
                              <span className="text-sm text-slate-600">Total: {event.data.totalAmount} FCFA</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
