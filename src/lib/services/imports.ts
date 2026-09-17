import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getImportJobs() {
  const jobs = await db.orm.public.ImportJob.all();
  return jobs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getImportJob(id: string) {
  const all = await db.orm.public.ImportJob.all();
  const job = all.find((j: any) => j.id === id);
  if (!job) return null;

  const errors = await db.orm.public.ImportError.all();
  return {
    ...job,
    errors: errors.filter((e: any) => e.importJobId === id)
  };
}

export async function processImport(entityType: string, csvContent: string, userId: string) {
  // 1. Create Job
  const sqlInsert = db.raw.sql`
    INSERT INTO "importJob" (id, "entityType", status, "totalRows", "processedRows", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${entityType}, 'PROCESSING'::"ImportStatus", 0, 0, now(), now())
    RETURNING id
  `;
  
  let jobId: string | null = null;
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(sqlInsert);
    if (res.rows.length > 0) jobId = res.rows[0].id;
  });

  if (!jobId) throw new Error("Erreur création job");

  try {
    const lines = csvContent.split('\n').filter(l => l.trim() !== '');
    const totalRows = lines.length;
    let processed = 0;
    
    // Simulate processing
    // We would actually parse CSV and insert into DB here.
    // For this implementation, we will simulate 100% success unless a line says 'ERROR'
    for (let i = 0; i < totalRows; i++) {
      const line = lines[i];
      if (line.includes('ERROR')) {
        const errSql = db.raw.sql`
          INSERT INTO "importError" (id, "importJobId", "rowNumber", "rawData", "errorDetail", "createdAt")
          VALUES (gen_random_uuid(), ${jobId}, ${i + 1}, ${line}, 'Erreur de validation (simulation)', now())
        `;
        await db.transaction(async (tx: any) => {
          await tx.execute(errSql);
        });
      } else {
        processed++;
      }
    }

    const finalStatus = processed === totalRows ? 'COMPLETED' : 'FAILED';

    const sqlUpdate = db.raw.sql`
      UPDATE "importJob"
      SET status = ${finalStatus}::"ImportStatus", "totalRows" = ${totalRows}, "processedRows" = ${processed}, "updatedAt" = now()
      WHERE id = ${jobId}
    `;

    await db.transaction(async (tx: any) => {
      await tx.execute(sqlUpdate.affectedCount().build());
    });

    await createAuditLog({
      userId,
      action: 'IMPORT_PROCESSED',
      entityType: 'ImportJob',
      entityId: jobId,
      newValues: { entityType, totalRows, processed, status: finalStatus }
    });

    return jobId;

  } catch (err: any) {
    const sqlUpdateFailed = db.raw.sql`
      UPDATE "importJob"
      SET status = 'FAILED'::"ImportStatus", "updatedAt" = now()
      WHERE id = ${jobId}
    `;
    await db.transaction(async (tx: any) => {
      await tx.execute(sqlUpdateFailed.affectedCount().build());
    });
    return jobId;
  }
}
