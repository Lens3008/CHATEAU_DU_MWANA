import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const tables = await db.orm.public.SiteSettings.all(); // just to test connection
  console.log('Connection OK, testing RLS...');

  await db.transaction(async (tx: any) => {
    const res = await tx.execute(
      db.raw.sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`.affectedCount().build()
    );
    console.log('Tables:', res);
  });

  await db.close();
}
run().catch(console.error);
