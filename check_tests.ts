import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const testServices = await db.orm.public.Service
    .where({ name: { contains: 'TEST' } })
    .all();
  
  const testFormulas = await db.orm.public.Formula
    .where({ name: { contains: 'TEST' } })
    .all();
    
  console.log(`Found ${testServices.length} TEST Services:`, testServices.map((s: any) => s.name));
  console.log(`Found ${testFormulas.length} TEST Formulas:`, testFormulas.map((f: any) => f.name));
  
  // Clean them up
  for (const ts of testServices) {
    const fCount = await db.raw.sql`DELETE FROM "formula" WHERE "serviceId" = ${ts.id}`.affectedCount();
    const sCount = await db.raw.sql`DELETE FROM "service" WHERE id = ${ts.id}`.affectedCount();
    console.log(`Deleted Service ${ts.name} (and ${fCount} formulas)`);
  }
  
  for (const tf of testFormulas) {
    const rCount = await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${tf.id}`.affectedCount();
    const fCount = await db.raw.sql`DELETE FROM "formula" WHERE id = ${tf.id}`.affectedCount();
    console.log(`Deleted Formula ${tf.name}`);
  }

  process.exit(0);
}
run();
