import 'dotenv/config';
import { db } from './src/lib/prisma';

async function run() {
  await db.connect();
  const items = await db.orm.public.GalleryItem.all();
  console.log("GALLERY ITEMS:", items);
  const galleries = await db.orm.public.Gallery.all();
  console.log("GALLERIES:", galleries);
  process.exit(0);
}
run();
