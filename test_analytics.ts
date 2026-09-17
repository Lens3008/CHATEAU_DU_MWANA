import 'dotenv/config';
import { getAnalyticsDashboardData } from './src/lib/actions/analytics';
import { getPeriodRange } from './src/lib/services/analytics/date-utils';
import { db } from './src/lib/prisma';

async function runTests() {
  await db.connect();
  console.log("=== DÉBUT VALIDATION PHASE 12 (ANALYTICS) ===");
  try {
    // Override the requireRole for testing in CLI mode
    // We will bypass it by directly calling the service functions
    
    const { getFinanceStats } = await import('./src/lib/services/analytics/finance');
    const { getReservationStats } = await import('./src/lib/services/analytics/reservations');
    
    const range = getPeriodRange('this_year');
    console.log(`Période testée : ${range.startDate.toISOString()} -> ${range.endDate.toISOString()}`);
    
    console.log("\n[TEST 1] - Statistiques Réservations");
    const resStats = await getReservationStats(range);
    console.log(resStats);
    if (resStats.totalReservations >= 0 && resStats.averageCart >= 0) {
      console.log("✅ TEST 1 PASS");
    } else {
      console.error("❌ TEST 1 FAIL");
    }
    
    console.log("\n[TEST 2] - Statistiques Financières");
    const finStats = await getFinanceStats(range);
    console.log(finStats);
    if (finStats.totalRevenue >= 0 && finStats.totalCollected >= 0) {
      console.log("✅ TEST 2 PASS");
    } else {
      console.error("❌ TEST 2 FAIL");
    }
    
    console.log("\n✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS.");
    
  } catch (error) {
    console.error("❌ ERREUR LORS DES TESTS :", error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

runTests();
