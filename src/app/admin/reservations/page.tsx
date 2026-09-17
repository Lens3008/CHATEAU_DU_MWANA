import { requireAuth, requireRole } from '@/lib/auth/user';
import { db } from '@/lib/prisma';
import Link from 'next/link';
import { Eye, Plus, Calendar, Clock, CreditCard } from 'lucide-react';

export const metadata = {
  title: 'Réservations | Château du Mwana Admin',
};

export default async function AdminReservationsPage() {
  const user = await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);

  // Prisma 8 ORM API
  const allReservations = await db.orm.public.Reservation.all();
  // We need to fetch customers and formulas to display nice names
  const allCustomers = await db.orm.public.Customer.all();
  const allFormulas = await db.orm.public.Formula.all();

  const reservations = allReservations.map((r: any) => {
    const customer = allCustomers.find((c: any) => c.id === r.customerId);
    const formula = allFormulas.find((f: any) => f.id === r.formulaId);
    
    // In Phase 11, we store formula directly in ReservationItem usually, 
    // but the schema says Reservation doesn't have a direct formula relation, 
    // it's in ReservationItem. 
    return {
      ...r,
      customer,
      formula // We will resolve this below if we need to
    };
  });
  
  // Actually, Reservation doesn't have formulaId in the schema directly!
  // Wait! Schema check: does Reservation have formulaId? 
  // Let's assume we need to fetch ReservationItem.
  const allItems = await db.orm.public.ReservationItem.all();
  for (const r of reservations) {
    const item = allItems.find((i: any) => i.reservationId === r.id);
    if (item) {
      r.formula = allFormulas.find((f: any) => f.id === item.formulaId);
    }
  }

  // Sort by date desc
  reservations.sort((a: any, b: any) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt.epochMilliseconds || a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt.epochMilliseconds || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
          <p className="text-muted-foreground">
            Gérez toutes les réservations, les paiements et le statut logistique.
          </p>
        </div>
        <Link
          href="/admin/reservations/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Réservation
        </Link>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Référence</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Prestation</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date prévue</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Paiement</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Aucune réservation trouvée.
                  </td>
                </tr>
              ) : (
                reservations.map((res: any) => {
                  const sDate = res.startDate instanceof Date ? res.startDate : new Date(res.startDate.epochMilliseconds || res.startDate);
                  const formattedDate = sDate.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <tr key={res.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">
                        {res.reference}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span>{res.customer ? `\${res.customer.firstName} \${res.customer.lastName}` : 'Client Inconnu'}</span>
                          {res.customer?.email && <span className="text-xs text-muted-foreground">{res.customer.email}</span>}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {res.formula ? res.formula.name : 'Sur mesure'}
                        <br />
                        <span className="text-xs text-muted-foreground">{res.participants} pers.</span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${
                          res.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          res.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {res.paymentStatus === 'PAID' ? 'Payé' : res.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente'}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {Number(res.totalAmount).toLocaleString('fr-FR')} FCFA
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${
                          res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          res.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link
                          href={`/admin/reservations/\${res.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
