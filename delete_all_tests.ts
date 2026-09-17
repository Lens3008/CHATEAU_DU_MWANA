import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const testFormulas = await db.orm.public.Formula
    .where({ name: 'TEST_FORMULA' })
    .all();
    
  console.log(`Found ${testFormulas.length} TEST_FORMULAs`);
  
  for (const tf of testFormulas) {
    const count = await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${tf.id}`.affectedCount();
    console.log(`Deleted ${count} reservation items`);
    const countF = await db.raw.sql`DELETE FROM "formula" WHERE id = ${tf.id}`.affectedCount();
    console.log(`Deleted ${countF} formulas`);
    if (tf.serviceId) {
      await db.raw.sql`DELETE FROM "service" WHERE id = ${tf.serviceId}`.affectedCount();
    }
  }

  const remaining = await db.orm.public.Formula.all();
  console.log("Remaining formulas count:", remaining.length);
  process.exit(0);
}
run();
