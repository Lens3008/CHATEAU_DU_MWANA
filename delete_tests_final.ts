import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  
  // Find EXACT matches
  const testServices = await db.orm.public.Service
    .where({ name: 'TEST_SERVICE' })
    .all();
  
  const testFormulas = await db.orm.public.Formula
    .where({ name: 'TEST_FORMULA' })
    .all();
    
  console.log(`Found ${testServices.length} TEST Services:`, testServices.map((s: any) => s.name));
  console.log(`Found ${testFormulas.length} TEST Formulas:`, testFormulas.map((f: any) => f.name));
  
  // Clean them up using transaction + tx.execute
  for (const ts of testServices) {
    const fIds = await db.orm.public.Formula.where({ serviceId: ts.id }).all();
    for (const f of fIds) {
      await db.transaction(async (tx: any) => {
        await tx.execute(db.raw.sql`DELETE FROM "ReservationItem" WHERE "formulaId" = ${f.id}`.affectedCount().build());
        await tx.execute(db.raw.sql`DELETE FROM "Formula" WHERE "id" = ${f.id}`.affectedCount().build());
      });
    }
    await db.transaction(async (tx: any) => {
      await tx.execute(db.raw.sql`DELETE FROM "Service" WHERE "id" = ${ts.id}`.affectedCount().build());
    });
    console.log(`Deleted Service ${ts.name}`);
  }
  
  for (const tf of testFormulas) {
    await db.transaction(async (tx: any) => {
      await tx.execute(db.raw.sql`DELETE FROM "ReservationItem" WHERE "formulaId" = ${tf.id}`.affectedCount().build());
      await tx.execute(db.raw.sql`DELETE FROM "Formula" WHERE "id" = ${tf.id}`.affectedCount().build());
    });
    console.log(`Deleted Formula ${tf.name}`);
  }

  process.exit(0);
}
run();
