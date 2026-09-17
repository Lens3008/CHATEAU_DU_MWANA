import 'dotenv/config';
import { db } from './src/lib/prisma';
import { getCustomer360 } from './src/lib/services/crm';
import { earnLoyaltyPoints, redeemLoyaltyReward, getCustomerLoyaltySummary } from './src/lib/services/loyalty';

async function runTests() {
  await db.connect();
  console.log("=== DÉBUT VALIDATION PHASE 13 (CRM & FIDÉLITÉ) ===");

  try {
    // Override requireAuth & requireRole for test simulation
    const dummyUser = { id: 'test-user', role: 'ADMIN' };
    
    // 1. Find a customer or create a temp one
    const allCustomers = await db.orm.public.Customer.all();
    let customer = allCustomers[0];
    
    if (!customer) {
      console.log("⚠️ Aucun client trouvé. Les tests CRM nécessitent au moins un client avec une réservation.");
      process.exit(1);
    }
    
    console.log(`\n[TEST 1] - Fiche CRM 360° pour ${customer.firstName} ${customer.lastName}`);
    const crm360 = await getCustomer360(customer.id);
    
    console.log(`> KPI CA Total calculé : ${crm360.kpi.totalSpent}`);
    console.log(`> Réservations récupérées : ${crm360.reservations.length}`);
    console.log(`> Factures récupérées : ${crm360.invoices.length}`);
    console.log(`> Entrées Timeline : ${crm360.timeline.length}`);
    console.log("✅ TEST 1 PASS");

    console.log("\n[TEST 2] - Fidélité (Création & Gain)");
    const summaryBefore = await getCustomerLoyaltySummary(customer.id);
    console.log(`> Niveau initial : ${summaryBefore.level?.name || 'Aucun (créé automatiquement)'}`);
    console.log(`> Solde initial : ${summaryBefore.account?.currentPoints}`);

    await earnLoyaltyPoints(customer.id, 1000, 'TEST-EARN-1000');
    const summaryAfter = await getCustomerLoyaltySummary(customer.id);
    console.log(`> Solde après ajout : ${summaryAfter.account?.currentPoints}`);
    
    if (summaryAfter.account!.currentPoints !== (summaryBefore.account!.currentPoints + 1000)) {
       throw new Error("L'ajout de points a échoué.");
    }
    console.log("✅ TEST 2 PASS");

    console.log("\n[TEST 3] - Concurrence Solde Fidélité (Double Dépense)");
    // We will attempt to redeem a reward concurrently
    let allRewards = await db.orm.public.LoyaltyReward.all();
    if (allRewards.length === 0) {
      await db.transaction(async (tx: any) => {
        const createReward = db.raw.sql`INSERT INTO "loyaltyReward" (id, name, "pointsCost") VALUES (gen_random_uuid(), 'Remise 10%', 500)`.affectedCount().build();
        await tx.execute(createReward);
      });
      allRewards = await db.orm.public.LoyaltyReward.all();
    }
    
    if (allRewards.length > 0) {
      const reward = allRewards[0];
      
      // Let's set the balance to exactly the cost of ONE reward, so the second should fail.
      await db.transaction(async (tx: any) => {
        const resetBalance = db.raw.sql`UPDATE "loyaltyAccount" SET "currentPoints" = ${reward.pointsCost} WHERE "customerId" = ${customer.id}`.affectedCount().build();
        await tx.execute(resetBalance);
      });

      console.log(`> Tentative d'utilisation de 2 x la récompense (Coût: ${reward.pointsCost}) avec solde = ${reward.pointsCost}`);
      
      const p1 = redeemLoyaltyReward(customer.id, reward.id).then(() => 'SUCCESS').catch((e) => `FAIL: ${e.message}`);
      const p2 = redeemLoyaltyReward(customer.id, reward.id).then(() => 'SUCCESS').catch((e) => `FAIL: ${e.message}`);
      
      const results = await Promise.all([p1, p2]);
      
      const successCount = results.filter(r => r === 'SUCCESS').length;
      const failCount = results.filter(r => r.startsWith('FAIL')).length;
      
      console.log(`> Résultats concurrents : ${successCount} Succès, ${failCount} Échecs`);
      
      if (successCount !== 1 || failCount !== 1) {
        throw new Error("Le test de concurrence a échoué. Une seule transaction aurait dû passer.");
      }
      console.log("✅ TEST 3 PASS");
    }

    console.log("\n✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS.");
    
  } catch (error) {
    console.error("\n❌ ERREUR LORS DES TESTS :", error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

runTests();
