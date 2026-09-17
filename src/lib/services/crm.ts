import { db } from '../prisma';

export async function getCustomers() {
  const allCustomers = await db.orm.public.Customer.all();
  const allReservations = await db.orm.public.Reservation.all();
  
  // Aggregate KPIs directly here for the list view
  const customersWithKpi = allCustomers.map((c: any) => {
    const custReservations = allReservations.filter((r: any) => r.customerId === c.id && r.status !== 'CANCELLED');
    const totalSpent = custReservations.reduce((sum: number, r: any) => sum + Number(r.totalAmount), 0);
    return {
      ...c,
      reservationsCount: custReservations.length,
      totalSpent
    };
  });
  
  return customersWithKpi;
}

export async function getCustomer360(customerId: string) {
  const allCustomers = await db.orm.public.Customer.all();
  const customer = allCustomers.find((c: any) => c.id === customerId);
  if (!customer) throw new Error("Client introuvable");

  const allLocations = await db.orm.public.Location.all();
  const locations = allLocations.filter((l: any) => l.customerId === customerId);

  const allReservations = await db.orm.public.Reservation.all();
  const reservations = allReservations.filter((r: any) => r.customerId === customerId).sort((a: any, b: any) => {
    const da = new Date(a.createdAt.toString());
    const dbD = new Date(b.createdAt.toString());
    return dbD.getTime() - da.getTime();
  });

  const allInvoices = await db.orm.public.Invoice.all();
  const invoices = allInvoices.filter((i: any) => i.customerId === customerId);

  const allPayments = await db.orm.public.Payment.all();
  const reservationIds = new Set(reservations.map((r: any) => r.id));
  const payments = allPayments.filter((p: any) => reservationIds.has(p.reservationId));

  const allTransactions = await db.orm.public.PaymentTransaction.all();
  const paymentIds = new Set(payments.map((p: any) => p.id));
  const transactions = allTransactions.filter((t: any) => paymentIds.has(t.paymentId));

  // Timeline
  let timeline: any[] = [];
  reservations.forEach((r: any) => timeline.push({ type: 'RESERVATION', date: new Date(r.createdAt.toString()), data: r }));
  invoices.forEach((i: any) => timeline.push({ type: 'INVOICE', date: new Date(i.createdAt.toString()), data: i }));
  transactions.forEach((t: any) => timeline.push({ type: 'PAYMENT', date: new Date(t.date.toString()), data: t }));
  
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  // KPIs
  const totalReservations = reservations.length;
  const completedReservations = reservations.filter((r: any) => r.status === 'COMPLETED').length;
  const cancelledReservations = reservations.filter((r: any) => r.status === 'CANCELLED').length;
  
  let totalSpent = 0;
  let totalParticipants = 0;
  reservations.forEach((r: any) => {
    if (r.status !== 'CANCELLED') {
      totalSpent += Number(r.totalAmount);
      if (r.participants) totalParticipants += r.participants;
    }
  });

  const cancellationRate = totalReservations > 0 ? (cancelledReservations / totalReservations) * 100 : 0;
  const averageCart = (totalReservations - cancelledReservations) > 0 ? totalSpent / (totalReservations - cancelledReservations) : 0;

  return {
    customer,
    locations,
    reservations,
    invoices,
    payments,
    transactions,
    timeline,
    kpi: {
      totalReservations,
      completedReservations,
      cancelledReservations,
      cancellationRate,
      totalSpent,
      totalParticipants,
      averageCart
    }
  };
}

export async function updateCustomerNotes(customerId: string, notes: string) {
  await db.transaction(async (tx: any) => {
    const res = db.raw.sql`UPDATE "customer" SET notes = ${notes} WHERE id = ${customerId}`.affectedCount().build();
    await tx.execute(res);
  });
}

export async function getCRMDashboardStats() {
  const allCustomers = await db.orm.public.Customer.all();
  const allReservations = await db.orm.public.Reservation.all();

  const totalCustomers = allCustomers.length;
  
  const activeCustomers = new Set();
  const newCustomers = new Set();
  const recurringCustomers = new Set();
  
  let totalRevenue = 0;

  allCustomers.forEach((c: any) => {
    const cRes = allReservations.filter((r: any) => r.customerId === c.id && r.status !== 'CANCELLED');
    if (cRes.length > 0) {
      activeCustomers.add(c.id);
      cRes.forEach((r: any) => {
        totalRevenue += Number(r.totalAmount);
      });
      if (cRes.length === 1) {
        newCustomers.add(c.id);
      } else {
        recurringCustomers.add(c.id);
      }
    }
  });

  return {
    totalCustomers,
    activeCustomersCount: activeCustomers.size,
    newCustomersCount: newCustomers.size,
    recurringCustomersCount: recurringCustomers.size,
    totalRevenue,
    averageCart: activeCustomers.size > 0 ? totalRevenue / activeCustomers.size : 0
  };
}
