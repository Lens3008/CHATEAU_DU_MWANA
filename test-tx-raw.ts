import 'dotenv/config';
import { db } from './src/lib/prisma';

async function main() {
  await db.connect();
  try {
    await db.transaction(async (tx: any) => {
      const plan = db.raw.sql`SELECT 1 as x FOR UPDATE`.affectedCount().build();
      const r = await tx.execute(plan);
      console.log('Result:', r);
    });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await db.close();
  }
}
main();
