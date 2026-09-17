import 'dotenv/config';
import { db } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

function walkDir(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function audit() {
  await db.connect();
  console.log("=== AUDIT DES FICHIERS PHYSIQUES ===");
  const publicDir = path.join(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');
  
  const files = walkDir(imagesDir).map(f => f.replace(publicDir, '').replace(/\\/g, '/'));
  console.log("Fichiers trouvés dans public/images/:");
  files.forEach(f => console.log(f));
  
  console.log("\n=== AUDIT DES MEDIAS EN BASE ===");
  const medias = await db.orm.public.Media.all();
  medias.forEach((m: any) => {
    const exists = files.includes(m.url);
    console.log(`[${exists ? 'PASS' : 'FAIL'}] DB URL: ${m.url} | ID: ${m.id}`);
  });
  
  console.log("\n=== AUDIT DE L'AFFECTATION DANS SERVICE ===");
  const services = await db.orm.public.Service.all();
  services.forEach((s: any) => {
    console.log(`Service: ${s.name} | Images JSON: ${JSON.stringify(s.images)}`);
  });

  console.log("\n=== AUDIT DE L'AFFECTATION DANS GALLERYITEM ===");
  const galleryItems = await db.raw.sql`
    SELECT gi.id, gi."mediaId", m.url, g.name as gallery_name
    FROM "galleryItem" gi
    JOIN "media" m ON gi."mediaId" = m.id
    JOIN "gallery" g ON gi."galleryId" = g.id
  `;
  const items = Array.isArray(galleryItems) ? galleryItems : [];
  items.forEach((gi: any) => {
    console.log(`GalleryItem: ${gi.id} | Media URL: ${gi.url} | Gallery: ${gi.gallery_name}`);
  });
  
  process.exit(0);
}

audit();
