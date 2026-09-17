import 'dotenv/config';
import { db } from './src/lib/prisma';

async function runTest() {
  await db.connect();
  console.log("=== VÉRIFICATION DES PRIX EN BASE DE DONNÉES ===");

  try {
    const formulas = await db.orm.public.Formula.all();
    
    // Test Anniversaire 3 - 35 élèves
    const anniv35 = formulas.find((f: any) => f.name === 'Anniversaire 3 - 35 élèves');
    if (!anniv35) {
      throw new Error("Formule 'Anniversaire 3 - 35 élèves' non trouvée.");
    }
    
    console.log("Anniversaire 3 + 35 élèves");
    console.log(`EXPECTED = 165000 FCFA`);
    console.log(`ACTUAL = ${anniv35.price} FCFA`);
    
    if (Number(anniv35.price) !== 165000) {
      throw new Error(`Le prix en base est ${anniv35.price} au lieu de 165000 !`);
    } else {
      console.log("✅ TEST PASS : Le prix en base est correct.");
    }

    // Vérification des 10 formules
    const expectedFormulas = [
      'Combo Medi',
      'Combo Mini',
      'Combo Kymou',
      'Combo Family',
      'Combo Keva',
      'Combo Kermesse K1',
      'Combo Kermesse K2',
      'Anniversaire 1',
      'Anniversaire 2',
      'Anniversaire 3'
    ];

    console.log("\n=== VÉRIFICATION DES SERVICES PRINCIPAUX ===");
    const services = await db.orm.public.Service.all();
    
    let allFound = true;
    for (const expected of expectedFormulas) {
      const s = services.find((s: any) => s.name === expected);
      if (s) {
        console.log(`✅ ${expected} trouvé`);
      } else {
        console.log(`❌ ${expected} MANQUANT`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log("✅ Les 10 formules officielles sont bien présentes dans le catalogue (Service).");
    }

  } catch (error) {
    console.error("ERREUR:", error);
    process.exit(1);
  }
}

runTest();
