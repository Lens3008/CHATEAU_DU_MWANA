import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  await db.transaction(async (tx: any) => {
    const r = await tx.execute(
      db.raw.sql`SELECT 1 as x`.affectedCount().build()
    );
    console.log('tx.raw.sql works:', r);
  });
  await db.close();
}
run().catch(console.error);
