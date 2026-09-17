import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const testServices = await db.orm.public.Service.all();
  const testFormulas = await db.orm.public.Formula.all();
    
  console.log(`All Services:`, testServices.map((s: any) => s.name));
  console.log(`All Formulas:`, testFormulas.map((f: any) => f.name));

  process.exit(0);
}
run();
