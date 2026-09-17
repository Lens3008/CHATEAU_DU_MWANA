import 'dotenv/config';
import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  
  try {
    // 1. SERVICES & FORMULES (Combos, Anniversaires, Kermesses, A la carte)
    const updates = [
      { name: 'Combo Mini', desc: "Le plaisir de faire la fête dans un format tout en douceur." },
      { name: 'Combo Kymou', desc: "Un joli mélange de jeux et de rires pour une fête pleine d'énergie." },
      { name: 'Combo Medi', desc: "Tout ce qu'il faut pour créer une journée de fête dont les enfants se souviendront." },
      { name: 'Combo Family', desc: "Un grand moment de jeu, de partage et de bonheur à vivre ensemble." },
      { name: 'Combo Keva', desc: "Une grande fête pensée pour multiplier les jeux, les sourires et les souvenirs." },
      { name: 'Combo Kermesse K1', desc: "L'ambiance joyeuse d'une véritable kermesse avec une multitude de jeux pour tous." },
      { name: 'Combo Kermesse K2', desc: "Une kermesse géante pour des éclats de rire inoubliables en famille ou entre amis." },
      { name: 'Anniversaire 1', desc: "Une formule pensée pour célébrer simplement et joliment un anniversaire inoubliable." },
      { name: 'Anniversaire 2', desc: "Une fête encore plus gourmande, colorée et généreuse pour faire plaisir aux petits invités." },
      { name: 'Anniversaire 3', desc: "Une expérience personnalisée pour faire de cette journée un souvenir vraiment unique." },
      { name: 'Trampoline 2.5', desc: "Pour sauter, rire et se dépenser en toute liberté." },
      { name: 'Trampoline 3.6', desc: "Encore plus d'espace pour laisser les enfants profiter pleinement du jeu." },
      { name: 'Trampoline 4.5 m', desc: "Le grand trampoline pour faire monter l'énergie et les éclats de rire." },
      { name: 'Château Puppy', desc: "Un univers coloré où les petits aventuriers peuvent jouer et s'amuser." },
      { name: 'Château Family', desc: "Un espace de jeu généreux pour partager un grand moment de fête." },
      { name: 'Château à obstacle', desc: "Des défis, du mouvement et beaucoup de rires pour une fête pleine d'énergie." },
      { name: 'Barbe à papa / Popcorn', desc: "Une petite touche gourmande qui donne à la fête son parfum de souvenir." }
    ];

    for (const update of updates) {
      // Update both Service and Formula
      await client.query(`UPDATE "service" SET description = $1 WHERE name = $2`, [update.desc, update.name]);
      // For formulas, we need to handle "Anniversaire 1 - 20 enfants" etc.
      await client.query(`UPDATE "formula" SET description = $1 WHERE name LIKE $2`, [update.desc, update.name + '%']);
      console.log(`Updated Service and Formula: ${update.name}`);
    }

    // 2. GALERIE
    const galleryUpdates = [
      { name: 'AGL', desc: "Une journée haute en couleurs, placée sous le signe du partage et de la bonne humeur." },
      { name: 'ALIBENDENG', desc: "Parce que la fête peut s'inviter partout où les sourires ont leur place." },
      { name: 'Noël chez Olam', desc: "Des couleurs, des rires et la magie de Noël signée Le Château du Mwana." },
      { name: 'GUIETSOU', desc: "Un souvenir de fête parmi les moments qui ont marqué notre histoire." }
    ];

    for (const update of galleryUpdates) {
      // Gallery name might be "17 août 2023 chez AGL" or just "AGL" etc, we use ILIKE
      await client.query(`UPDATE "gallery" SET description = $1 WHERE name ILIKE $2`, [update.desc, '%' + update.name + '%']);
      console.log(`Updated Gallery: ${update.name}`);
    }
    
  } finally {
    await client.end();
  }

  process.exit(0);
}
run();
