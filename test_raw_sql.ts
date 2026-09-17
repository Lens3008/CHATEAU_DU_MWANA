import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(
      db.raw.sql`
        SELECT f.id, f.name, f.price, f.description, f.capacity, f.duration, s.images
        FROM "Formula" f
        LEFT JOIN "Service" s ON f."serviceId" = s.id
        WHERE f.availability = true 
        ORDER BY f.price ASC 
        LIMIT 3
      `.affectedCount().build()
    );
    console.log(res);
  });
  process.exit(0);
}
run();
