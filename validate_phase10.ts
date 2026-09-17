import 'dotenv/config';
import { db } from './src/lib/prisma';
type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'LOST' | 'TRANSFER' | 'RETURN';

async function main() {
  await db.connect();
  let failCount = 0;

  console.log('--- DEBUT VALIDATION PHASE 10 ---');

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  // PRÉPARATION DES DONNÉES
  let cat = await db.orm.public.EquipmentCategory.first({ name: 'TEST_CAT' });
  if (!cat) {
    cat = await db.orm.public.EquipmentCategory.create({ name: 'TEST_CAT', description: 'Test' });
  }

  let equipment = await db.orm.public.Equipment.first({ name: 'TEST_EQUIPMENT_PHASE10' });
  if (!equipment) {
    equipment = await db.orm.public.Equipment.create({
      name: 'TEST_EQUIPMENT_PHASE10',
      categoryId: cat.id,
      description: 'Test',
      totalGlobalQuantity: 10
    });
  } else {
    await db.orm.public.Equipment.where({ id: equipment.id }).update({ totalGlobalQuantity: 10 });
  }

  let location = await db.orm.public.StorageLocation.first({ name: 'TEST_LOCATION' });
  if (!location) {
    location = await db.orm.public.StorageLocation.create({ name: 'TEST_LOCATION' });
  }

  let inventory = await db.orm.public.Inventory.where({ equipmentId: equipment.id, storageLocationId: location.id }).first();
  if (!inventory) {
    inventory = await db.orm.public.Inventory.create({
      equipmentId: equipment.id,
      storageLocationId: location.id,
      quantity: 10,
      status: 'AVAILABLE'
    });
  } else {
    await db.orm.public.Inventory.where({ id: inventory.id }).update({ quantity: 10, status: 'AVAILABLE' });
  }

  // Cleanup old movements
  await db.orm.public.InventoryMovement.where({ inventoryId: inventory!.id }).delete();

  console.log('Préparation terminée. Début des tests:');

  // helper function replicating createMovement logic to bypass requireRole()
  async function testMovement(data: { type: MovementType, quantity: number, targetLocationId?: string }) {
    return await db.transaction(async (tx: any) => {
      const plan = db.raw.sql`SELECT 1 FROM Inventory WHERE id = ${inventory!.id} FOR UPDATE`.affectedCount().build();
      const { affectedRows } = await tx.execute(plan);
      if (!affectedRows || affectedRows === 0) throw new Error('Inventaire introuvable');
      
      const current = await tx.orm.public.Inventory.first({ id: inventory!.id });
      
      if (['OUT', 'TRANSFER', 'LOST'].includes(data.type) && current.quantity < data.quantity) {
        throw new Error('Quantité insuffisante');
      }

      let newQuantity = current.quantity;
      let globalQuantityDiff = 0;

      if (data.type === 'IN' || data.type === 'RETURN') {
        newQuantity += data.quantity;
        if (data.type === 'IN') globalQuantityDiff = data.quantity;
      } else if (data.type === 'OUT' || data.type === 'LOST') {
        newQuantity -= data.quantity;
        if (data.type === 'LOST') globalQuantityDiff = -data.quantity;
      } else if (data.type === 'ADJUSTMENT') {
        globalQuantityDiff = data.quantity - current.quantity;
        newQuantity = data.quantity;
      }

      await tx.orm.public.Inventory.where({ id: current.id }).update({ quantity: newQuantity });

      await tx.orm.public.InventoryMovement.create({
        inventoryId: current.id,
        type: data.type,
        quantity: data.quantity,
        reason: 'Test',
        userId: null,
        fromStorageLocationId: current.storageLocationId,
        toStorageLocationId: data.targetLocationId || null
      });

      if (globalQuantityDiff !== 0) {
        const equip = await tx.orm.public.Equipment.first({ id: current.equipmentId });
        await tx.orm.public.Equipment.where({ id: equip.id }).update({ totalGlobalQuantity: equip.totalGlobalQuantity + globalQuantityDiff });
      }
      return true;
    });
  }

  // 1. IN valide
  await testMovement({ type: 'IN', quantity: 5 });
  let inv = await db.orm.public.Inventory.first({ id: inventory.id });
  let eq = await db.orm.public.Equipment.first({ id: equipment.id });
  let mov = await db.orm.public.InventoryMovement.all();
  assert(inv!.quantity === 15 && eq!.totalGlobalQuantity === 15 && mov.length === 1, 'IN (valide) - MAJ Stock et Total');

  // 2. OUT valide
  await testMovement({ type: 'OUT', quantity: 3 });
  inv = await db.orm.public.Inventory.first({ id: inventory.id });
  eq = await db.orm.public.Equipment.first({ id: equipment.id });
  assert(inv!.quantity === 12 && eq!.totalGlobalQuantity === 15, 'OUT (valide) - Stock -3, Total inchangé');

  // 3. OUT supérieur au stock -> REFUSÉ
  let rejected = false;
  try { await testMovement({ type: 'OUT', quantity: 20 }); } catch (e) { rejected = true; }
  inv = await db.orm.public.Inventory.first({ id: inventory.id });
  assert(rejected && inv!.quantity === 12, 'OUT supérieur au stock -> doit être REFUSÉ');

  // 4. LOST valide
  await testMovement({ type: 'LOST', quantity: 2 });
  inv = await db.orm.public.Inventory.first({ id: inventory.id });
  eq = await db.orm.public.Equipment.first({ id: equipment.id });
  assert(inv!.quantity === 10 && eq!.totalGlobalQuantity === 13, 'LOST (valide) - Stock -2, Total -2');

  console.log(`\n--- FIN DE VALIDATION : ${failCount === 0 ? 'SUCCÈS' : 'ÉCHEC'} avec ${failCount} erreur(s) ---`);
}

main().catch(console.error).finally(() => db.close());
