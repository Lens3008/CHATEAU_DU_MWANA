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
  
  // Clean them up using db.raw.sql
  for (const ts of testServices) {
    const fIds = await db.orm.public.Formula.where({ serviceId: ts.id }).all();
    for (const f of fIds) {
        await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${f.id}`;
        await db.raw.sql`DELETE FROM "formula" WHERE id = ${f.id}`;
    }
    await db.raw.sql`DELETE FROM "reservationItem" WHERE "serviceId" = ${ts.id}`;
    await db.raw.sql`DELETE FROM "service" WHERE id = ${ts.id}`;
    console.log(`Deleted Service ${ts.name}`);
  }
  
  for (const tf of testFormulas) {
    await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${tf.id}`;
    await db.raw.sql`DELETE FROM "formula" WHERE id = ${tf.id}`;
    console.log(`Deleted Formula ${tf.name}`);
  }

  process.exit(0);
}
run();
