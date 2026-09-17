import 'dotenv/config';
import { db } from './src/lib/prisma';
import { createReservation } from './src/lib/services/reservation';
import { addPayment, addRefund } from './src/lib/services/payment';
import { checkFormulaAvailability } from './src/lib/services/availability';
import { Temporal } from '@js-temporal/polyfill';

async function main() {
  await db.connect();
  let failCount = 0;
  console.log('--- DEBUT VALIDATION PHASE 11 ---');

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  // PRÉPARATION (ORM)
  let allCustomers = await db.orm.public.Customer.all();
  let customer = allCustomers.find((c: any) => c.firstName === 'TEST' && c.lastName === 'CUSTOMER');
  if (!customer) {
    customer = await db.orm.public.Customer.create({ firstName: 'TEST', lastName: 'CUSTOMER', phone: '0000000000', updatedAt: Temporal.Now.instant() });
  }

  let allLocs = await db.orm.public.Location.all();
  let location = allLocs.find((l: any) => l.name === 'TEST_LOCATION_11');
  if (!location) {
    location = await db.orm.public.Location.create({ name: 'TEST_LOCATION_11', isChateau: true, updatedAt: Temporal.Now.instant() });
  }

  let allCats = await db.orm.public.ServiceCategory.all();
  let cat = allCats.find((c: any) => c.name === 'TEST_SVC_CAT');
  if (!cat) {
    cat = await db.orm.public.ServiceCategory.create({ name: 'TEST_SVC_CAT' });
  }

  let allServices = await db.orm.public.Service.all();
  let service = allServices.find((s: any) => s.name === 'TEST_SERVICE');
  if (!service) {
    service = await db.orm.public.Service.create({ name: 'TEST_SERVICE', categoryId: cat.id, basePrice: 10000, availability: true });
  }

  let allFormulas = await db.orm.public.Formula.all();
  let formula = allFormulas.find((f: any) => f.name === 'TEST_FORMULA');
  if (!formula) {
    formula = await db.orm.public.Formula.create({
      name: 'TEST_FORMULA',
      serviceId: service.id,
      price: 15000,
      capacity: 50,
      duration: 120, // 2 hours
      availability: true
    });
  }

  let allEqCats = await db.orm.public.EquipmentCategory.all();
  let eqCat = allEqCats.find((c: any) => c.name === 'TEST_CAT');
  if (!eqCat) {
    eqCat = await db.orm.public.EquipmentCategory.create({ name: 'TEST_CAT' });
  }
  let allEqs = await db.orm.public.Equipment.all();
  let equipment = allEqs.find((e: any) => e.name === 'TEST_EQ_11');
  if (!equipment) {
    equipment = await db.orm.public.Equipment.create({ name: 'TEST_EQ_11', categoryId: eqCat.id, totalGlobalQuantity: 10 });
  }
  
  let allStorageLocs = await db.orm.public.StorageLocation.all();
  let eqLoc = allStorageLocs.find((l: any) => l.name === 'TEST_LOCATION');
  if (!eqLoc) {
    eqLoc = await db.orm.public.StorageLocation.create({ name: 'TEST_LOCATION' });
  }
  let allInventories = await db.orm.public.Inventory.all();
  let inventory = allInventories.find((i: any) => i.equipmentId === equipment.id);
  if (!inventory) {
    inventory = await db.orm.public.Inventory.create({ equipmentId: equipment.id, storageLocationId: eqLoc.id, quantity: 10, status: 'AVAILABLE' });
  } else {
    await db.orm.public.Inventory.where({ id: inventory.id }).update({ quantity: 10 });
  }

  let allResources = await db.orm.public.ServiceResource.all();
  let resource = allResources.find((r: any) => r.formulaId === formula.id && r.equipmentId === equipment.id);
  if (!resource) {
    await db.orm.public.ServiceResource.create({ formulaId: formula.id, equipmentId: equipment.id, requiredQuantity: 2 });
  }

  // NETTOYAGE COMPLET
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`DELETE FROM "refund"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "paymentTransactionHistory"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "paymentTransaction"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "payment"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "inventoryAllocation"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "reservationStatusHistory"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "reservationItem"`.affectedCount().build());
    await tx.execute(db.raw.sql`DELETE FROM "reservation"`.affectedCount().build());
  });

  console.log('Préparation terminée. Début des tests:');

  // TEST 1: Check Availability OK
  const start1 = new Date();
  start1.setHours(start1.getHours() + 24); // tomorrow
  const end1 = new Date(start1.getTime() + 120 * 60000);

  const start1Temp = Temporal.Instant.from(start1.toISOString());
  const end1Temp = Temporal.Instant.from(end1.toISOString());

  const avail1 = await checkFormulaAvailability(db, formula.id, start1, end1, 10);
  assert(avail1.isAvailable, 'TEST 1 - checkFormulaAvailability (Valide)');

  // TEST 2: Check Capacity exceeded
  const avail2 = await checkFormulaAvailability(db, formula.id, start1, end1, 60);
  assert(!avail2.isAvailable && avail2.reason!.includes('Capacité maximale dépassée'), 'TEST 2 - Capacité dépassée (Refus)');

  // TEST 3: Create Reservation
  const res1 = await createReservation({
    customerId: customer.id,
    formulaId: formula.id,
    startDate: start1Temp as any,
    endDate: end1Temp as any,
    participants: 10,
    locationId: location.id,
    locationType: 'VENUE'
  });
  assert(res1 && res1.reference.startsWith('MW-'), 'TEST 3 - Création Réservation transactionnelle');

  // Check Allocations
  const allAllocs = await db.orm.public.InventoryAllocation.all();
  const allocs = allAllocs.filter((a: any) => a.reservationId === res1.id);
  assert(allocs.length === 1 && allocs[0].quantityAllocated === 2, 'TEST 3 - Allocation de 2 équipements confirmée');

  // TEST 4: Concurrence sur ressources
  for (let i = 0; i < 4; i++) {
    await createReservation({
      customerId: customer.id,
      formulaId: formula.id,
      startDate: start1Temp as any,
      endDate: end1Temp as any,
      participants: 5,
      locationId: location.id,
      locationType: 'VENUE'
    });
  }
  
  let rejected = false;
  try {
    await createReservation({
      customerId: customer.id,
      formulaId: formula.id,
      startDate: start1Temp as any,
      endDate: end1Temp as any,
      participants: 5,
      locationId: location.id,
      locationType: 'VENUE'
    });
  } catch (e: any) {
    rejected = e.message.includes('Disponibilité insuffisante');
  }
  assert(rejected, 'TEST 4 - Épuisement des ressources bloque la réservation (Refus attendu)');

  // TEST 5: Paiement
  const { newStatus: st1 } = await addPayment({ reservationId: res1.id, amount: 5000, method: 'CASH' });
  assert(st1 === 'PARTIAL', 'TEST 5 - Paiement partiel -> PARTIAL');

  const { newStatus: st2 } = await addPayment({ reservationId: res1.id, amount: 10000, method: 'CARD' });
  assert(st2 === 'PAID', 'TEST 5 - Paiement complet -> PAID');

  let overpay = false;
  try {
    await addPayment({ reservationId: res1.id, amount: 1000, method: 'CASH' });
  } catch (e: any) {
    overpay = e.message.includes('dépasse le reste à payer');
  }
  assert(overpay, 'TEST 5 - Surpaiement interdit');

  console.log(`\n--- FIN DE VALIDATION : ${failCount === 0 ? 'SUCCÈS' : 'ÉCHEC'} avec ${failCount} erreur(s) ---`);
}

main().catch(console.error).finally(() => db.close());
