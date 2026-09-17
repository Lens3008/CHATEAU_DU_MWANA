import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const testFormula = await db.orm.public.Formula
    .where({ name: 'TEST_FORMULA' })
    .first();
    
  if (testFormula) {
    console.log("Found TEST_FORMULA:", testFormula.id);
    
    // Delete any reservation items referencing this formula
    const count = await db.raw.sql`DELETE FROM "reservationItem" WHERE "formulaId" = ${testFormula.id}`.affectedCount();
    console.log(`Deleted ${count} ReservationItems referencing TEST_FORMULA.`);
    
    await db.raw.sql`DELETE FROM "formula" WHERE id = ${testFormula.id}`.affectedCount();
    console.log("TEST_FORMULA deleted.");
    
    if (testFormula.serviceId) {
      await db.raw.sql`DELETE FROM "service" WHERE id = ${testFormula.serviceId}`.affectedCount();
      console.log("TEST_SERVICE deleted.");
    }
  } else {
    console.log("TEST_FORMULA not found.");
  }

  // Check remaining formulas
  const remaining = await db.orm.public.Formula.all();
  console.log("Remaining formulas count:", remaining.length);

  process.exit(0);
}
run();
