import 'dotenv/config';
import { db } from './src/lib/prisma';

async function seed() {
  await db.connect();
  console.log('Début du seed...');
  try {
    // 1. Categories
    console.log('Seed: Categories');
    let categories = await db.orm.public.ServiceCategory.all();
    let catFormules = categories.find((c: any) => c.name === 'Formules');
    let catALaCarte = categories.find((c: any) => c.name === 'À la carte');

    if (!catFormules) {
      console.log('Création catégorie: Formules');
      await db.transaction(async (tx: any) => {
        await tx.execute(db.raw.sql`INSERT INTO "serviceCategory" (id, name, description) VALUES (gen_random_uuid(), 'Formules', 'Formules tout compris')`.affectedCount().build());
      });
      categories = await db.orm.public.ServiceCategory.all();
      catFormules = categories.find((c: any) => c.name === 'Formules');
    }
    if (!catALaCarte) {
      console.log('Création catégorie: À la carte');
      await db.transaction(async (tx: any) => {
        await tx.execute(db.raw.sql`INSERT INTO "serviceCategory" (id, name, description) VALUES (gen_random_uuid(), 'À la carte', 'Prestations individuelles')`.affectedCount().build());
      });
      categories = await db.orm.public.ServiceCategory.all();
      catALaCarte = categories.find((c: any) => c.name === 'À la carte');
    }

    // 2. Medias (Local files mapped to public/images paths)
    const images = [
      { name: 'Combo Medi', path: '/images/Nos Formules/combo medi .png' },
      { name: 'Combo Mini', path: '/images/Nos Formules/combo mini .png' },
      { name: 'Combo Kymou', path: '/images/Nos Formules/combo kymous .png' },
      { name: 'Combo Family', path: '/images/Nos Formules/combo familly.png' },
      { name: 'Combo Keva', path: '/images/Nos Formules/combos kevas.png' },
      { name: 'Combo Kermesse K1', path: '/images/Nos Formules/combos kermesse K1.png' },
      { name: 'Combo Kermesse K2', path: '/images/Nos Formules/combo kermesse K2.png' },
      { name: 'Anniversaire 1', path: '/images/Nos Formules/Formule Anniversaires 1.png' },
      { name: 'Anniversaire 2', path: '/images/Nos Formules/Formule Anniversaires 2.png' },
      { name: 'Anniversaire 3', path: '/images/Nos Formules/Formule Anniversaires 3.png' },
      { name: 'Trampoline 2.5', path: '/images/aires de jeux/Trampoline 2.5.jpeg' },
      { name: 'Trampoline 3.6', path: '/images/aires de jeux/Trampoline 3.6.jpeg' },
      { name: 'Trampoline 4.5 m', path: '/images/aires de jeux/Trampoline 4.5m.jpeg' },
      { name: 'Château Puppy', path: '/images/aires de jeux/Châteaux Gonflables.jpeg' },
      { name: 'Château Family', path: '/images/aires de jeux/Châteaux Gonflables.jpeg' },
      { name: 'Château à obstacle', path: '/images/aires de jeux/Châteaux Gonflables.jpeg' },
      { name: 'Barbe à papa / Popcorn', path: '/images/aires de jeux/Barbe à papa.jpeg' },
      { name: 'AGL', path: '/images/Prestations/17 août 2023 chez AGL (AFRICA GLOBAL LOGISTICS).jpg' },
      { name: 'ALIBENDENG', path: '/images/Prestations/ALIBENDENG.jfif' },
      { name: 'Noël chez Olam', path: '/images/Prestations/Noël chez Olam.jpg' },
      { name: 'GUIETSOU', path: '/images/Prestations/GHIETSOU.jpg' }
    ];

    let medias = await db.orm.public.Media.all();
    for (const img of images) {
      let media = medias.find((m: any) => m.url === img.path);
      if (!media) {
        console.log('Création Media:', img.path);
        await db.transaction(async (tx: any) => {
          await tx.execute(db.raw.sql`
            INSERT INTO "media" (id, url, type, "createdAt")
            VALUES (gen_random_uuid(), ${img.path}, 'IMAGE', now())
          `.affectedCount().build());
        });
      }
    }
    medias = await db.orm.public.Media.all();

    // Helper to find media JSON array
    const getMediaJson = (path: string) => {
      const media = medias.find((m: any) => m.url === path);
      return media ? [{ mediaId: media.id, url: media.url }] : [];
    };

    // 3. Services and Formulas
    const servicesData = [
      {
        category: catFormules.id,
        name: 'Combo Medi',
        basePrice: 110000,
        capacity: 30,
        description: '1 petit château gonflable\n1 petit trampoline\n1 choix : barbe à papa OU gaufres OU popcorn\n24 chaises avec tables\n3 chevaux',
        image: '/images/Nos Formules/combo medi .png'
      },
      {
        category: catFormules.id,
        name: 'Combo Mini',
        basePrice: 60000,
        capacity: 20,
        description: '1 petit trampoline\n1 chenille OU 1 toboggan\n13 chaises avec tables\n3 chevaux',
        image: '/images/Nos Formules/combo mini .png'
      },
      {
        category: catFormules.id,
        name: 'Combo Kymou',
        basePrice: 90000,
        capacity: 30,
        description: '1 petit château gonflable OU 1 petit trampoline\n1 petit toboggan OU 1 chenille\n1 choix : barbe à papa OU gaufres OU popcorn\n3 chevaux',
        image: '/images/Nos Formules/combo kymous .png'
      },
      {
        category: catFormules.id,
        name: 'Combo Family',
        basePrice: 150000,
        capacity: 30,
        description: '1 grand château gonflable\n1 grand trampoline\n1 choix : barbe à papa OU gaufres OU popcorn\n24 chaises avec tables\n3 chevaux',
        image: '/images/Nos Formules/combo familly.png'
      },
      {
        category: catFormules.id,
        name: 'Combo Keva',
        basePrice: 190000,
        capacity: 40,
        description: '1 grand château gonflable\n1 grand trampoline\n1 choix : barbe à papa OU hot-dog OU popcorn\n30 chaises avec tables\n5 chevaux',
        image: '/images/Nos Formules/combos kevas.png'
      },
      {
        category: catFormules.id,
        name: 'Combo Kermesse K1',
        basePrice: 50000,
        capacity: 0,
        description: '1 chenille\n1 toboggan\n3 bascules solos OU chevaux gonflables\n2 bascules doubles\n\nOption:\n10 chaises + 1 table = 5 000 FCFA',
        image: '/images/Nos Formules/combos kermesse K1.png'
      },
      {
        category: catFormules.id,
        name: 'Combo Kermesse K2',
        basePrice: 75000,
        capacity: 0,
        description: '1 chenille\n1 petit toboggan\n3 bascules solos OU chevaux gonflables\n2 bascules doubles\n1 machine OU 1 mascotte\n\nOption:\n10 chaises + 1 table = 5 000 FCFA',
        image: '/images/Nos Formules/combo kermesse K2.png'
      },
      {
        category: catFormules.id,
        name: 'Anniversaire 1',
        basePrice: 65000, // 20 élèves (base)
        capacity: 20,
        description: 'gâteau crème au beurre avec bougie\nmini brique de jus\nassiettes\npochettes\ncuillères\n1 chapeau OU 1 couronne OU 1 écharpe "Joyeux Anniversaire"\n\nGagnez du temps : choisissez une formule, personnalisez-la au besoin et nous la livrons.\nFormules pour 20, 25, 30 et 35 élèves.',
        image: '/images/Nos Formules/Formule Anniversaires 1.png',
        subFormulas: [
          { name: 'Anniversaire 1 - 20 élèves', price: 65000, capacity: 20 },
          { name: 'Anniversaire 1 - 25 élèves', price: 75000, capacity: 25 },
          { name: 'Anniversaire 1 - 30 élèves', price: 85000, capacity: 30 },
          { name: 'Anniversaire 1 - 35 élèves', price: 95000, capacity: 35 }
        ]
      },
      {
        category: catFormules.id,
        name: 'Anniversaire 2',
        basePrice: 95000,
        capacity: 20,
        description: 'gâteau crème au beurre avec bougie\nmini briques de jus\nbiscuits / cookies / chips\nassiettes\npochettes\ncuillères\n1 chapeau OU 1 couronne OU 1 écharpe\nsacs retour : madeleines, bonbons, ballons, figurines...\n\nGagnez du temps : choisissez une formule, personnalisez-la au besoin et nous la livrons.\nFormules pour 20, 25, 30 et 35 élèves.',
        image: '/images/Nos Formules/Formule Anniversaires 2.png',
        subFormulas: [
          { name: 'Anniversaire 2 - 20 élèves', price: 95000, capacity: 20 },
          { name: 'Anniversaire 2 - 25 élèves', price: 110000, capacity: 25 },
          { name: 'Anniversaire 2 - 30 élèves', price: 130000, capacity: 30 },
          { name: 'Anniversaire 2 - 35 élèves', price: 140000, capacity: 35 }
        ]
      },
      {
        category: catFormules.id,
        name: 'Anniversaire 3',
        basePrice: 120000,
        capacity: 20,
        description: 'gâteau avec photo + bougie\nmini briques de jus\nbiscuits / cookies / chips\nassiettes\npochettes\ncuillères\n1 écharpe personnalisée\nsacs retour : madeleines, bonbons, ballons, figurines...\nT-shirt personnalisé\n\nGagnez du temps : choisissez une formule, personnalisez-la au besoin et nous la livrons.\nFormules pour 20, 25, 30 et 35 élèves.',
        image: '/images/Nos Formules/Formule Anniversaires 3.png',
        subFormulas: [
          { name: 'Anniversaire 3 - 20 élèves', price: 120000, capacity: 20 },
          { name: 'Anniversaire 3 - 25 élèves', price: 135000, capacity: 25 },
          { name: 'Anniversaire 3 - 30 élèves', price: 150000, capacity: 30 },
          { name: 'Anniversaire 3 - 35 élèves', price: 165000, capacity: 35 }
        ]
      },
      // A la carte
      {
        category: catALaCarte.id,
        name: 'Trampoline 2.5',
        basePrice: 40000,
        capacity: 0,
        description: 'Trampoline 2.5m',
        image: '/images/aires de jeux/Trampoline 2.5.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Trampoline 3.6',
        basePrice: 60000,
        capacity: 0,
        description: 'Trampoline 3.6m',
        image: '/images/aires de jeux/Trampoline 3.6.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Trampoline 4.5 m',
        basePrice: 80000,
        capacity: 0,
        description: 'Trampoline 4.5m',
        image: '/images/aires de jeux/Trampoline 4.5m.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Château Puppy',
        basePrice: 50000,
        capacity: 0,
        description: '4 m × 3 m',
        image: '/images/aires de jeux/Châteaux Gonflables.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Château Family',
        basePrice: 80000,
        capacity: 0,
        description: '9 m × 3 m',
        image: '/images/aires de jeux/Châteaux Gonflables.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Château à obstacle',
        basePrice: 80000,
        capacity: 0,
        description: '9 m × 3 m',
        image: '/images/aires de jeux/Châteaux Gonflables.jpeg'
      },
      {
        category: catALaCarte.id,
        name: 'Barbe à papa / Popcorn',
        basePrice: 35000,
        capacity: 0,
        description: 'Inclus :\nmachine à barbe à papa\nmain-d’œuvre\nconsommables\ntransport inclus dans Libreville, Owendo et Akanda',
        image: '/images/aires de jeux/Barbe à papa.jpeg'
      }
    ];

    let dbServices = await db.orm.public.Service.all();
    let dbFormulas = await db.orm.public.Formula.all();

    for (const data of servicesData) {
      let svc = dbServices.find((s: any) => s.name === data.name);
      if (!svc) {
        console.log('Création Service:', data.name);
        await db.transaction(async (tx: any) => {
          await tx.execute(db.raw.sql`
            INSERT INTO "service" (id, "categoryId", name, description, "basePrice", capacity, images)
            VALUES (gen_random_uuid(), ${data.category}, ${data.name}, ${data.description}, ${data.basePrice}, ${data.capacity ?? 0}, ${JSON.stringify(getMediaJson(data.image))}::jsonb)
          `.affectedCount().build());
        });
        dbServices = await db.orm.public.Service.all();
        svc = dbServices.find((s: any) => s.name === data.name);
      } else {
        // Update images and description to be 100% sure
        await db.transaction(async (tx: any) => {
          await tx.execute(db.raw.sql`
            UPDATE "service" SET description = ${data.description}, images = ${JSON.stringify(getMediaJson(data.image))}::jsonb
            WHERE id = ${svc.id}
          `.affectedCount().build());
        });
      }

      // Create formulas
      if (data.subFormulas) {
        for (const sub of data.subFormulas) {
          let f = dbFormulas.find((fo: any) => fo.name === sub.name && fo.serviceId === svc.id);
          if (!f) {
            console.log('Création Formula:', sub.name);
            await db.transaction(async (tx: any) => {
              await tx.execute(db.raw.sql`
                INSERT INTO "formula" (id, "serviceId", name, price, capacity)
                VALUES (gen_random_uuid(), ${svc.id}, ${sub.name}, ${sub.price}, ${sub.capacity ?? 0})
              `.affectedCount().build());
            });
          } else {
             // update price and capacity
             await db.transaction(async (tx: any) => {
                await tx.execute(db.raw.sql`
                  UPDATE "formula" SET price = ${sub.price}, capacity = ${sub.capacity ?? 0}
                  WHERE id = ${f.id}
                `.affectedCount().build());
             });
          }
        }
      } else {
        // Create 1-to-1 formula
        let f = dbFormulas.find((fo: any) => fo.name === data.name && fo.serviceId === svc.id);
        if (!f) {
          console.log('Création Formula (1:1):', data.name);
          await db.transaction(async (tx: any) => {
            await tx.execute(db.raw.sql`
              INSERT INTO "formula" (id, "serviceId", name, price, capacity, description)
              VALUES (gen_random_uuid(), ${svc.id}, ${data.name}, ${data.basePrice}, ${data.capacity ?? 0}, ${data.description})
            `.affectedCount().build());
          });
        } else {
            // update price, description
            await db.transaction(async (tx: any) => {
                await tx.execute(db.raw.sql`
                  UPDATE "formula" SET price = ${data.basePrice}, capacity = ${data.capacity ?? 0}, description = ${data.description}
                  WHERE id = ${f.id}
                `.affectedCount().build());
            });
        }
      }
    }

    // 4. Gallery / Realizations
    let galleries = await db.orm.public.Gallery.all();
    let mainGallery = galleries.find((g: any) => g.name === 'Réalisations');
    if (!mainGallery) {
      console.log('Création Galerie: Réalisations');
      await db.transaction(async (tx: any) => {
        await tx.execute(db.raw.sql`INSERT INTO "gallery" (id, name, description, "createdAt") VALUES (gen_random_uuid(), 'Réalisations', 'Nos plus beaux événements', now())`.affectedCount().build());
      });
      galleries = await db.orm.public.Gallery.all();
      mainGallery = galleries.find((g: any) => g.name === 'Réalisations');
    }

    const realizations = [
      { name: 'AGL', path: '/images/Prestations/17 août 2023 chez AGL (AFRICA GLOBAL LOGISTICS).jpg' },
      { name: 'ALIBENDENG', path: '/images/Prestations/ALIBENDENG.jfif' },
      { name: 'Noël chez Olam', path: '/images/Prestations/Noël chez Olam.jpg' },
      { name: 'GUIETSOU', path: '/images/Prestations/GHIETSOU.jpg' }
    ];

    let galleryItems = await db.orm.public.GalleryItem.all();
    
    for (let i = 0; i < realizations.length; i++) {
      const real = realizations[i];
      const media = medias.find((m: any) => m.url === real.path);
      if (media) {
        const existing = galleryItems.find((gi: any) => gi.galleryId === mainGallery.id && gi.mediaId === media.id);
        if (!existing) {
          console.log('Ajout à la galerie:', real.name);
          await db.transaction(async (tx: any) => {
            await tx.execute(db.raw.sql`
              INSERT INTO "galleryItem" (id, "galleryId", "mediaId", "order")
              VALUES (gen_random_uuid(), ${mainGallery.id}, ${media.id}, ${i})
            `.affectedCount().build());
          });
        }
      }
    }

    console.log('Seed terminé avec succès !');
  } catch (error) {
    console.error('Erreur durant le seed:', error);
  }
}

seed();
