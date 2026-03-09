import { PrismaClient, PhaseType, DeliverableTemplateDifficulty } from '@prisma/client';
import type { DeliverableTemplateData } from './types';
import { initiationTemplates } from './initiation';
import { planningTemplates } from './planning';
import { executionTemplates } from './execution';
import { monitoringTemplates } from './monitoring';
import { closureTemplates } from './closure';

const allTemplates: DeliverableTemplateData[] = [
  ...initiationTemplates,
  ...planningTemplates,
  ...executionTemplates,
  ...monitoringTemplates,
  ...closureTemplates,
];

export async function seedDeliverableTemplates(
  prisma: PrismaClient,
  tenantId: string,
  createdById: string,
) {
  let created = 0;
  let updated = 0;

  for (const t of allTemplates) {
    const result = await prisma.deliverableTemplate.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        type: t.type,
        phase: t.phase as PhaseType,
        description: t.description,
        content: t.content,
        evaluationCriteria: t.evaluationCriteria as any,
        pmiProcess: t.pmiProcess,
        difficulty: t.difficulty as DeliverableTemplateDifficulty,
        referenceExample: t.referenceExample,
        isActive: true,
        version: 2,
      },
      create: {
        id: t.id,
        tenantId,
        createdById,
        title: t.title,
        type: t.type,
        phase: t.phase as PhaseType,
        description: t.description,
        content: t.content,
        evaluationCriteria: t.evaluationCriteria as any,
        pmiProcess: t.pmiProcess,
        difficulty: t.difficulty as DeliverableTemplateDifficulty,
        referenceExample: t.referenceExample,
        isActive: true,
        version: 1,
      },
    });

    // If version is 2, it was updated; if 1, it was created
    if (result.version === 2) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(
    `Seeded: ${allTemplates.length} deliverable templates (${created} created, ${updated} updated)`,
  );
}

export { allTemplates };
export type { DeliverableTemplateData } from './types';
