// @ts-nocheck
import { db } from '../prisma';

export async function getCustomerLoyaltySummary(customerId: string) {
  const allAccounts = await db.orm.public.LoyaltyAccount.all();
  let account = allAccounts.find((a: any) => a.customerId === customerId);

  if (!account) {
    // Determine the lowest level and create
    const allLevels = await db.orm.public.LoyaltyLevel.all();
    let defaultLevel = allLevels.find((l: any) => l.pointsThreshold === 0);
    if (!defaultLevel && allLevels.length > 0) {
      defaultLevel = allLevels.sort((a: any, b: any) => a.pointsThreshold - b.pointsThreshold)[0];
    }
    
    if (!defaultLevel) {
      await db.transaction(async (tx: any) => {
        const res = await db.raw.sql`INSERT INTO "loyaltyLevel" (id, name, "pointsThreshold") VALUES (gen_random_uuid(), 'Découverte', 0) RETURNING id, name, "pointsThreshold"`.affectedCount().build();
        await tx.execute(res);
      });
      const refreshedLevels = await db.orm.public.LoyaltyLevel.all();
      defaultLevel = refreshedLevels.find((l: any) => l.pointsThreshold === 0);
    }
    
    if (defaultLevel) {
      await db.transaction(async (tx: any) => {
        // Double check
        const accounts = await tx.orm.public.LoyaltyAccount.all();
        if (!accounts.find((a: any) => a.customerId === customerId)) {
          const res = await db.raw.sql`INSERT INTO "loyaltyAccount" (id, "customerId", "loyaltyLevelId", "currentPoints", "joinedAt") VALUES (gen_random_uuid(), ${customerId}, ${defaultLevel.id}, 0, now()) RETURNING id`.affectedCount().build();
          await tx.execute(res);
        }
      });
      // Fetch again
      const refreshedAccounts = await db.orm.public.LoyaltyAccount.all();
      account = refreshedAccounts.find((a: any) => a.customerId === customerId);
    }
  }

  const allLevels = await db.orm.public.LoyaltyLevel.all();
  const level = account && account.loyaltyLevelId ? allLevels.find((l: any) => l.id === account.loyaltyLevelId) : null;

  const allTransactions = await db.orm.public.LoyaltyTransaction.all();
  const transactions = allTransactions.filter((t: any) => t.accountId === account?.id).sort((a: any, b: any) => {
    const da = new Date(a.date.toString());
    const dbD = new Date(b.date.toString());
    return dbD.getTime() - da.getTime();
  });

  return {
    account,
    level,
    transactions
  };
}

export async function earnLoyaltyPoints(customerId: string, points: number, referenceId?: string) {
  if (points <= 0) throw new Error("Les points à gagner doivent être positifs.");
  
  return await db.transaction(async (tx: any) => {
    const allAccounts = await tx.orm.public.LoyaltyAccount.all();
    const account = allAccounts.find((a: any) => a.customerId === customerId);
    if (!account) throw new Error("Compte de fidélité introuvable.");

    // Lock account
    const lock = db.raw.sql`SELECT 1 FROM "loyaltyAccount" WHERE id = ${account.id} FOR UPDATE`.affectedCount().build();
    await tx.execute(lock);
    
    // Refetch to get latest balance after lock
    const latestAccounts = await tx.orm.public.LoyaltyAccount.all();
    const latestAccount = latestAccounts.find((a: any) => a.id === account.id);
    if (!latestAccount) throw new Error("Compte de fidélité introuvable après lock.");

    const newBalance = latestAccount.currentPoints + points;

    // Insert transaction
    const tr = db.raw.sql`INSERT INTO "loyaltyTransaction" (id, "accountId", "points", "type", "referenceId", "date") VALUES (gen_random_uuid(), ${account.id}, ${points}, 'EARN', ${referenceId || null}, now())`.affectedCount().build();
    await tx.execute(tr);

    // Update balance
    const up = db.raw.sql`UPDATE "loyaltyAccount" SET "currentPoints" = ${newBalance}, "totalPointsEarned" = "totalPointsEarned" + ${points} WHERE id = ${account.id}`.affectedCount().build();
    await tx.execute(up);

    // Re-evaluate level (async task or immediately here)
    await evaluateLoyaltyLevel(tx, account.id, newBalance);

    return newBalance;
  });
}

export async function redeemLoyaltyReward(customerId: string, rewardId: string) {
  return await db.transaction(async (tx: any) => {
    const allAccounts = await tx.orm.public.LoyaltyAccount.all();
    const account = allAccounts.find((a: any) => a.customerId === customerId);
    if (!account) throw new Error("Compte de fidélité introuvable.");

    // Lock account
    const lock = db.raw.sql`SELECT 1 FROM "loyaltyAccount" WHERE id = ${account.id} FOR UPDATE`.affectedCount().build();
    await tx.execute(lock);

    // Refetch to get latest balance after lock
    const latestAccounts = await tx.orm.public.LoyaltyAccount.all();
    const latestAccount = latestAccounts.find((a: any) => a.id === account.id);
    if (!latestAccount) throw new Error("Compte de fidélité introuvable après lock.");

    const allRewards = await tx.orm.public.LoyaltyReward.all();
    const reward = allRewards.find((r: any) => r.id === rewardId);
    if (!reward) throw new Error("Récompense introuvable.");

    if (latestAccount.currentPoints < reward.pointsCost) {
      throw new Error(`Solde insuffisant. Requis: ${reward.pointsCost}, Disponible: ${latestAccount.currentPoints}`);
    }

    const newBalance = latestAccount.currentPoints - reward.pointsCost;

    // Insert transaction
    const tr = db.raw.sql`INSERT INTO "loyaltyTransaction" (id, "accountId", "rewardId", "points", "type", "date") VALUES (gen_random_uuid(), ${account.id}, ${reward.id}, ${reward.pointsCost}, 'REDEEM', now())`.affectedCount().build();
    await tx.execute(tr);

    // Update balance
    const up = db.raw.sql`UPDATE "loyaltyAccount" SET "currentPoints" = ${newBalance} WHERE id = ${account.id}`.affectedCount().build();
    await tx.execute(up);

    return newBalance;
  });
}

async function evaluateLoyaltyLevel(tx: any, accountId: string, currentPoints: number) {
  // In a real scenario, level evaluation might depend on historical accumulated points, not just current balance.
  // Assuming it depends on current balance for now, or total points earned.
  // Let's assume the rule is based on total points earned historically.
  const allTx = await tx.orm.public.LoyaltyTransaction.all();
  const accountTx = allTx.filter((t: any) => t.accountId === accountId && t.type === 'EARN');
  const totalEarned = accountTx.reduce((sum: number, t: any) => sum + Number(t.points), 0);
  
  // Actually we should include the new points if they are not in the query yet. 
  // For simplicity, let's just query again.
  const allLevels = await tx.orm.public.LoyaltyLevel.all();
  const sortedLevels = allLevels.sort((a: any, b: any) => b.pointsThreshold - a.pointsThreshold);
  
  const earned = totalEarned; // this total is historical
  
  let newLevel = null;
  for (const level of sortedLevels) {
    if (earned >= level.pointsThreshold) {
      newLevel = level;
      break;
    }
  }
  
  if (newLevel) {
    const up = db.raw.sql`UPDATE "loyaltyAccount" SET "loyaltyLevelId" = ${newLevel.id} WHERE id = ${accountId}`.affectedCount().build();
    await tx.execute(up);
  }
}

export async function getAllRewards() {
  return await db.orm.public.LoyaltyReward.all();
}
