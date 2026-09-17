// @ts-nocheck
import { requireAuth, requireRole } from '@/lib/auth/user';
import { db } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Calendar, Clock, CreditCard, Box, Tag, FileText } from 'lucide-react';
import PaymentForm from '@/components/admin/PaymentForm';
import InvoiceButton from '@/components/admin/InvoiceButton';

export const metadata = {
  title: 'Détail Réservation | Château du Mwana Admin',
};

export default async function AdminReservationDetailPage({ params }: { params: { id: string } }) {
  // P5: Allow staff roles AND CLIENT (CLIENT gets isolation check below)
  const user = await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY', 'CLIENT']);

  const { id } = params;

  const matchingReservations = await db.orm.public.Reservation.where({ id }).all();
  const reservation = matchingReservations[0];

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">Réservation introuvable</h2>
        <p className="text-muted-foreground mt-2">La référence demandée n&apos;existe pas ou a été supprimée.</p>
        <Link href={user.role === 'CLIENT' ? '/dashboard/reservations' : '/admin/reservations'} className="mt-4 text-primary hover:underline">
          Retour aux réservations
        </Link>
      </div>
    );
  }

  // P5 SECURITY: CLIENT can ONLY view THEIR OWN reservations
  if (user.role === 'CLIENT') {
    if (!user.customerId || reservation.customerId !== user.customerId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Réservation introuvable</h2>
          <p className="text-muted-foreground mt-2">La référence demandée n&apos;existe pas ou a été supprimée.</p>
          <Link href="/dashboard/reservations" className="mt-4 text-primary hover:underline">
            Retour à mes réservations
          </Link>
        </div>
      );
    }
  }

  const customerArr = await db.orm.public.Customer.where({ id: reservation.customerId }).all();
  const customer = customerArr[0];

  const locationArr = reservation.locationId ? await db.orm.public.Location.where({ id: reservation.locationId }).all() : [];
  const location = locationArr[0];

  const items = await db.orm.public.ReservationItem.where({ reservationId: id }).all();

  const allFormulas = await db.orm.public.Formula.all();
  // enrich items with formula
  for (const item of items) {
    if (item.formulaId) {
      item.formula = allFormulas.find((f: any) => f.id === item.formulaId);
    }
  }

  const payments = await db.orm.public.Payment.where({ reservationId: id }).all();
  const invoices = await db.orm.public.Invoice.where({ reservationId: id }).all();

  const allPaymentTransactions = await db.orm.public.PaymentTransaction.all();
  // enrich payments with transactions
  for (const p of payments) {
    p.transactions = allPaymentTransactions.filter((t: any) => t.paymentId === p.id);
  }

  const history = await db.orm.public.ReservationStatusHistory.where({ reservationId: id }).all();

  const allocations = await db.orm.public.InventoryAllocation.where({ reservationId: id }).all();

  const allEquipment = await db.orm.public.Equipment.all();
  for (const a of allocations) {
    a.equipment = allEquipment.find((e: any) => e.id === a.equipmentId);
  }

  const sDate = reservation.startDate instanceof Date ? reservation.startDate : new Date(reservation.startDate.epochMilliseconds || reservation.startDate);
  const eDate = reservation.endDate instanceof Date ? reservation.endDate : new Date(reservation.endDate.epochMilliseconds || reservation.endDate);

  // Back link depends on role
  const backHref = user.role === 'CLIENT' ? '/dashboard/reservations' : '/admin/reservations';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réservation {reservation.reference}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
              reservation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
              reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {reservation.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              reservation.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
              reservation.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              Paiement: {reservation.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Client Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Client</h3>
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {customer ? (
              <div className="space-y-1">
                <p className="text-lg font-bold">{customer.firstName} {customer.lastName}</p>
                {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Information client non disponible</p>
            )}
          </div>
        </div>

        {/* Détails Date & Lieu */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Lieu & Date</h3>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{sDate.toLocaleDateString('fr-FR')} - {eDate.toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{sDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} à {eDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="flex items-start gap-2 text-sm mt-2 pt-2 border-t">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-medium">{location ? location.name : reservation.locationType}</span>
                {location && location.address && <p className="text-xs text-muted-foreground">{location.address}</p>}
                {location && location.detailedAddress && <p className="text-xs text-muted-foreground">{location.detailedAddress}</p>}
                {location && location.city && <p className="text-xs text-muted-foreground">{location.city}{location.commune ? `, ${location.commune}` : ''}</p>}
                {location && location.accessInstructions && <p className="text-xs text-muted-foreground mt-1 italic">{location.accessInstructions}</p>}
                {location && location.contactPhone && <p className="text-xs text-muted-foreground">Tél: {location.contactPhone}</p>}
                {location && location.latitude && location.longitude && (
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      📍 Google Maps
                    </a>
                    <a
                      href={`http://maps.apple.com/?ll=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      🗺️ Apple Plans
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prestations */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Prestations</h3>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <p className="text-2xl font-bold">{Number(reservation.totalAmount).toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-muted-foreground">{reservation.participants} participants</p>
            <div className="mt-4 space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.formula ? item.formula.name : 'Service divers'}</span>
                  <span className="font-medium">{Number(item.totalPrice).toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Paiements */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Suivi Financier</h3>
              </div>
              {/* Encaisser button only for staff */}
              {user.role !== 'CLIENT' && (
                <div className="flex items-center gap-2">
                  <InvoiceButton reservationId={id} />
                </div>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {payments.map((p: any) => (
                <div key={p.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total attendu:</span>
                    <span className="font-medium">{Number(p.totalExpected).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total payé:</span>
                    <span className="font-medium text-emerald-600">{Number(p.totalPaid).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reste à payer:</span>
                    <span className="font-bold text-destructive">{(Number(p.totalExpected) - Number(p.totalPaid)).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  
                  {p.transactions && p.transactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Transactions</h4>
                      {p.transactions.map((t: any) => (
                        <div key={t.id} className="flex justify-between text-xs py-1">
                          <span>
                            {new Date(t.date?.epochMilliseconds || t.date).toLocaleDateString('fr-FR')} - {t.method}
                            {t.transactionReference && <span className="ml-1 text-muted-foreground">({t.transactionReference})</span>}
                          </span>
                          <span className={t.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}>
                            {t.type === 'REFUND' ? '-' : '+'}{Number(t.amount).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {user.role !== 'CLIENT' && payments[0] && (
                <PaymentForm
                  reservationId={id}
                  remaining={Math.max(0, Number(payments[0].totalExpected) - Number(payments[0].totalPaid))}
                />
              )}
              {invoices.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold">Factures</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    {invoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                        <span>{invoice.number}</span>
                        <span>{Number(invoice.totalAmount).toLocaleString('fr-FR')} FCFA · {invoice.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logistique */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Allocation Logistique</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Matériel bloqué pour cette réservation.
            </p>
            {allocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun matériel requis pour cette réservation.</p>
            ) : (
              <div className="space-y-3">
                {allocations.map((a: any) => (
                  <div key={a.id} className="flex justify-between items-center text-sm border p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${a.status === 'RESERVED' ? 'bg-amber-500' : a.status === 'DEPLOYED' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      <span>{a.equipment ? a.equipment.name : 'Matériel inconnu'}</span>
                    </div>
                    <span className="font-medium font-mono bg-muted px-2 py-0.5 rounded">x{a.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
