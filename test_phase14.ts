import { db } from './src/lib/prisma';
import { supabaseAdmin } from './src/lib/supabase/admin';
import { ensureBucket } from './src/lib/services/media';

async function runTests() {
  console.log("=== Lancement des tests de validation Phase 14 ===\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: any, message: string) {
    if (condition) {
      console.log(`✅ ${message}`);
      passed++;
    } else {
      console.error(`❌ ${message}`);
      failed++;
    }
  }

  try {
    // 1. Tests CMS
    const pages = await db.orm.public.ContentPage.all();
    assert(Array.isArray(pages), "CMS - Les pages peuvent être lues.");

    // 2. Tests Média & Storage (RBAC / RLS)
    await ensureBucket();
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket('medias');
    assert(!bucketError && bucketData?.name === 'medias', "MEDIA - Le bucket 'medias' existe.");

    // 3. Tests Galerie
    const galleries = await db.orm.public.Gallery.all();
    assert(Array.isArray(galleries), "GALLERY - Les galeries peuvent être lues.");

    // 4. Tests Templates
    const templates = await db.orm.public.DocumentTemplate.all();
    assert(Array.isArray(templates), "TEMPLATES - Les templates documentaires sont accessibles.");

    // 5. Tests Contact
    const messages = await db.orm.public.ContactMessage.all();
    assert(Array.isArray(messages), "CONTACT - Les messages de contact sont accessibles.");

    // 6. Tests Notifications
    const notifications = await db.orm.public.Notification.all();
    assert(Array.isArray(notifications), "NOTIFICATIONS - Les notifications sont gérées.");

    // 7. Tests Imports
    const jobs = await db.orm.public.ImportJob.all();
    assert(Array.isArray(jobs), "IMPORTS - Les tâches d'importation sont gérées.");
    
    // Summary
    console.log(`\n=== Bilan : ${passed} succès, ${failed} échecs ===`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Erreur critique durant les tests:", error);
    process.exit(1);
  }
}

runTests();
