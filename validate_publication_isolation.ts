import 'dotenv/config';
import { db } from './src/lib/prisma';
import { getPublicFormulaById, getPublicFormulas, getPublicServices } from './src/lib/public-catalogue';
import { createReservation } from './src/lib/services/reservation';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`[FAIL] ${message}`);
  console.log(`[PASS] ${message}`);
}

async function main() {
  await db.connect();

  const allFormulas = await db.orm.public.Formula.all();
  const allServices = await db.orm.public.Service.all();
  const publicFormulas = await getPublicFormulas();
  const publicServices = await getPublicServices();
  const testFormula = allFormulas.find((formula: any) => formula.name === 'TEST_FORMULA');
  const testB3Formula = allFormulas.find((formula: any) => formula.name === 'TEST_B3_FORMULA');

  assert(
    publicFormulas.some((formula: any) => formula.availability && formula.isPublished),
    'Une formule disponible et publiée apparaît dans le catalogue public',
  );
  assert(
    publicFormulas.every((formula: any) => formula.isPublished && formula.service?.isPublished),
    'Les formules publiques ont une formule et un service publiés',
  );
  assert(
    publicServices.every((service: any) => service.availability && service.isPublished),
    'Les services non publiés sont exclus du catalogue public',
  );
  assert(
    testFormula?.isPublished === false && testB3Formula?.isPublished === false,
    'TEST_FORMULA et TEST_B3_FORMULA restent disponibles pour les tests internes mais non publiés',
  );
  assert(
    testFormula && (await getPublicFormulaById(testFormula.id)) === null,
    'Une formule de test ne peut pas être obtenue par la lecture publique par UUID',
  );

  if (testFormula) {
    let rejected = false;
    try {
      await createReservation({
        customerId: 'publication-isolation-check',
        formulaId: testFormula.id,
        startDate: new Date(),
        participants: 1,
        locationId: 'publication-isolation-check',
        locationType: 'VENUE',
        publicFormulaOnly: true,
      });
    } catch (error) {
      rejected = error instanceof Error && error.message === 'Formule introuvable.';
    }
    assert(rejected, 'Une réservation publique directe par UUID de fixture est refusée');
  }

  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});
