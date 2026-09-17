import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  
  // Find EXACT matches
  const testServices = await db.orm.public.Service
    .where({ name: 'TEST_SERVICE' })
    .all();
  
  const testFormulas = await db.orm.public.Formula
    .where({ name: 'TEST_FORMULA' })
    .all();
    
  console.log(`Found ${testServices.length} TEST Services:`, testServices.map((s: any) => s.name));
  console.log(`Found ${testFormulas.length} TEST Formulas:`, testFormulas.map((f: any) => f.name));
  
  // Clean them up using ORM
  for (const ts of testServices) {
    // delete related reservation items first
    const fIds = await db.orm.public.Formula.where({ serviceId: ts.id }).all().then((fs: any) => fs.map((f: any) => f.id));
    for (const fId of fIds) {
       await db.orm.public.ReservationItem.where({ formulaId: fId }).delete();
       await db.orm.public.Formula.where({ id: fId }).delete();
    }
    await db.orm.public.ReservationItem.where({ serviceId: ts.id }).delete();
    await db.orm.public.Service.where({ id: ts.id }).delete();
    console.log(`Deleted Service ${ts.name} completely via ORM`);
  }
  
  for (const tf of testFormulas) {
    await db.orm.public.ReservationItem.where({ formulaId: tf.id }).delete();
    await db.orm.public.Formula.where({ id: tf.id }).delete();
    console.log(`Deleted Formula ${tf.name} completely via ORM`);
  }

  process.exit(0);
}
run();
