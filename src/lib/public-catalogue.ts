import { db } from '@/lib/prisma';

type PublicService = {
  id: string;
  availability: boolean;
  isPublished: boolean;
};

type PublicFormula = {
  serviceId: string;
  availability: boolean;
  isPublished: boolean;
  service?: PublicService | null;
};

export async function getPublicFormulas() {
  const formulas = await (db.orm.public.Formula as any)
    .where({ availability: true, isPublished: true })
    .include('service')
    .all();

  return formulas.filter((formula: PublicFormula) =>
    formula.service?.availability === true &&
    formula.service.isPublished === true
  );
}

export async function getPublicServices() {
  const services = await (db.orm.public.Service as any)
    .where({ availability: true, isPublished: true })
    .all();

  return services.filter((service: PublicService) =>
    service.availability === true && service.isPublished === true
  );
}

export async function getPublicFormulaById(formulaId: string) {
  const formulas = await (db.orm.public.Formula as any)
    .where({ id: formulaId, availability: true, isPublished: true })
    .include('service')
    .all();

  const formula = formulas[0];
  if (
    !formula ||
    formula.service?.availability !== true ||
    formula.service?.isPublished !== true
  ) {
    return null;
  }

  return formula;
}
