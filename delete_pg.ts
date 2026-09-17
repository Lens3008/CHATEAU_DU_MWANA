import 'dotenv/config';
import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  
  try {
    const { rows: testServices } = await client.query(`SELECT id, name FROM "service" WHERE name = 'TEST_SERVICE'`);
    const { rows: testFormulas } = await client.query(`SELECT id, name FROM "formula" WHERE name = 'TEST_FORMULA'`);
    
    console.log(`Found ${testServices.length} TEST Services:`, testServices.map((s: any) => s.name));
    console.log(`Found ${testFormulas.length} TEST Formulas:`, testFormulas.map((f: any) => f.name));
    
    for (const ts of testServices) {
      const { rows: fIds } = await client.query(`SELECT id FROM "formula" WHERE "serviceId" = $1`, [ts.id]);
      for (const f of fIds) {
          await client.query(`DELETE FROM "reservationItem" WHERE "formulaId" = $1`, [f.id]);
          await client.query(`DELETE FROM "invoiceItem" WHERE "formulaId" = $1`, [f.id]);
          await client.query(`DELETE FROM "serviceResource" WHERE "formulaId" = $1`, [f.id]);
          await client.query(`DELETE FROM "formula" WHERE "id" = $1`, [f.id]);
      }
      await client.query(`DELETE FROM "service" WHERE "id" = $1`, [ts.id]);
      console.log(`Deleted Service ${ts.name}`);
    }
    
    for (const tf of testFormulas) {
      await client.query(`DELETE FROM "reservationItem" WHERE "formulaId" = $1`, [tf.id]);
      await client.query(`DELETE FROM "invoiceItem" WHERE "formulaId" = $1`, [tf.id]);
      await client.query(`DELETE FROM "serviceResource" WHERE "formulaId" = $1`, [tf.id]);
      await client.query(`DELETE FROM "formula" WHERE "id" = $1`, [tf.id]);
      console.log(`Deleted Formula ${tf.name}`);
    }
  } finally {
    await client.end();
  }

  process.exit(0);
}
run();
