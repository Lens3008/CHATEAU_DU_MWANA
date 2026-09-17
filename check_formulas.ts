import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const formulas = await db.orm.public.Formula.all();
  formulas.forEach(f => console.log(`${f.name} = ${f.price}`));
  process.exit(0);
}
run();
