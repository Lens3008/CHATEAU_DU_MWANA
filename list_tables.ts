import 'dotenv/config';
import { db } from './src/lib/prisma';

async function test() {
  await db.connect();
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(
      db.raw.sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`.affectedCount().build()
    );
    console.log("TABLES:");
    console.log(res);
  });
  await db.close();
}
test();
