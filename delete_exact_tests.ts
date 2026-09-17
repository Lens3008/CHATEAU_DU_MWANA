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
  
  // Clean them up using exact match IDs
  for (const ts of testServices) {
    const fCount = await db.raw.sql`DELETE FROM "formula" WHERE "serviceId" = ${ts.id}`.affectedCount();
    console.log(`Deleted ${fCount} formulas belonging to TEST_SERVICE`);
    const riCount = await db.raw.sql`DELETE FROM "reservationItem" WHERE "serviceId" = ${ts.id}`.affectedCount();
    console.log(`Deleted ${riCount} reservation items belonging to TEST_SERVICE`);
    const sCount = await db.raw.sql`DELETE FROM "service" WHERE id = ${ts.id}`.affectedCount();
    console.log(`Deleted Service ${ts.name}`);
  }
  
  for (const tf of testFormulas) {
    const rCount = await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${tf.id}`.affectedCount();
    console.log(`Deleted ${rCount} reservation items belonging to TEST_FORMULA`);
    const fCount = await db.raw.sql`DELETE FROM "formula" WHERE id = ${tf.id}`.affectedCount();
    console.log(`Deleted Formula ${tf.name}`);
  }

  process.exit(0);
}
run();
