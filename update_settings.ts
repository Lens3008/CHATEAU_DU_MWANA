import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const settings = await db.orm.public.SiteSettings.first();
  if (settings) {
    console.log("Current address:", settings.address);
    if (settings.address && settings.address.includes('Brazzaville')) {
      const updated = settings.address.replace(/Brazzaville(,\s*Congo)?/g, 'Libreville, Gabon');
      await db.transaction(async (tx: any) => {
        await tx.execute(
          db.raw.sql`UPDATE "SiteSettings" SET address = ${updated} WHERE id = ${settings.id}`.affectedCount().build()
        );
      });
      console.log("Updated address to:", updated);
    }
  } else {
    console.log("No SiteSettings found.");
  }
  process.exit(0);
}
run();
