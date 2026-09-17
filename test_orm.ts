import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const res = await (db.orm.public.Formula as any)
    .where({ availability: true })
    .orderBy((f: any) => f.price.asc())
    .include('service')
    .limit(3)
    .all();
  console.log(res);
  process.exit(0);
}
run();
