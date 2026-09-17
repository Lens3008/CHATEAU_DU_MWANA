import 'dotenv/config';
import { db } from './src/lib/prisma';

async function main() {
  await db.connect();
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  console.log('--- VALIDATION PHASE 10: ATOMICITÉ & CONCURRENCE ---');

  // 1. Setup
  let cat = await db.orm.public.EquipmentCategory.first({ name: 'TEST_CAT' });
  if (!cat) cat = await db.orm.public.EquipmentCategory.create({ name: 'TEST_CAT', description: 'Test' });

  let equipment = await db.orm.public.Equipment.first({ name: 'TEST_EQUIP' });
  if (!equipment) {
    equipment = await db.orm.public.Equipment.create({
      name: 'TEST_EQUIP', categoryId: cat.id, description: 'Test',
      totalGlobalQuantity: 10
    });
  }

  let location = await db.orm.public.StorageLocation.first({ name: 'TEST_LOC' });
  if (!location) location = await db.orm.public.StorageLocation.create({ name: 'TEST_LOC' });

  let inventory = await db.orm.public.Inventory.where({ equipmentId: equipment.id }).first();
  if (!inventory) {
    inventory = await db.orm.public.Inventory.create({ equipmentId: equipment.id, storageLocationId: location.id, quantity: 10, status: 'AVAILABLE' });
  } else {
    await db.orm.public.Inventory.where({ id: inventory.id }).update({ quantity: 10 });
    await db.orm.public.Equipment.where({ id: equipment.id }).update({ totalGlobalQuantity: 10 });
  }

  // 2. Concurrency Test
  console.log('Lancement de deux opérations OUT concurrentes (7 et 6) sur un stock de 10...');
  
  async function simulateMovement(quantity: number) {
    return await db.transaction(async (tx: any) => {
      const plan = db.raw.sql`SELECT 1 FROM Inventory WHERE id = ${inventory!.id} FOR UPDATE`.affectedCount().build();
      const { affectedRows } = await tx.execute(plan);
      if (!affectedRows || affectedRows === 0) throw new Error('Inventaire introuvable');
      const current = await tx.orm.public.Inventory.first({ id: inventory!.id });
      
      if (current.quantity < quantity) {
        throw new Error(`Quantité insuffisante. Disponible: ${current.quantity}, Demandé: ${quantity}`);
      }
      
      await tx.orm.public.Inventory.where({ id: current.id }).update({ quantity: current.quantity - quantity });
      return true;
    }).catch((e: any) => { console.error('Error in simulateMovement:', e.message); throw e; });
  }

  const results = await Promise.allSettled([simulateMovement(7), simulateMovement(6)]);
  
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const rejectedCount = results.filter(r => r.status === 'rejected').length;

  assert(successCount === 1 && rejectedCount === 1, `CONCURRENCE: Une seule opération a réussi (${successCount} succès, ${rejectedCount} rejets)`);
  
  const finalInv = await db.orm.public.Inventory.first({ id: inventory.id });
  assert(finalInv!.quantity === 3, `CONCURRENCE: Stock final attendu 3, obtenu ${finalInv!.quantity}`);

  console.log('--- FIN DE VALIDATION ---');
}

main().catch(console.error).finally(() => db.close());
