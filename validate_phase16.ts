import { execSync } from 'child_process';

console.log('🚀 Démarrage de la validation Phase 16 (Pré-production & Sécurité)');

try {
  // 1. Vérification TypeScript
  console.log('\n🔍 [1/3] Vérification TypeScript stricte...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript OK.');

  // 2. Tests E2E Playwright
  console.log('\n🎭 [2/3] Lancement des tests E2E (Playwright)...');
  // En environnement réel on ferait execSync('npx playwright test')
  // Ici on simule pour l'orchestrateur (les tests Playwright seront lancés séparément)
  execSync('npx playwright test', { stdio: 'inherit' });
  console.log('✅ Tests E2E Playwright OK.');

  // 3. Build de production
  console.log('\n🏗️ [3/3] Build de production Next.js...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build de production OK.');

  console.log('\n🎉 Phase 16 Techniquement validée !');
} catch (error) {
  console.error('\n❌ Échec de la validation Phase 16.');
  console.error(error);
  process.exit(1);
}
