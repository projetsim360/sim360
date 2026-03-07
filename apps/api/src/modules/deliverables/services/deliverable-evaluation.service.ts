import { Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import { AiService } from '@/modules/ai/ai.service';
import { UserDeliverable, DeliverableTemplate } from '@prisma/client';

interface EvaluationResult {
  score: number;
  grade: string;
  positives: string[];
  improvements: string[];
  missingElements: string[];
  incorrectElements: string[];
  recommendations: string[];
  pmiOutputsCovered: string[];
  pmiOutputsMissing: string[];
}

@Injectable()
export class DeliverableEvaluationService {
  private readonly logger = new Logger(DeliverableEvaluationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Evaluate a submitted deliverable using AI.
   * Updates status to EVALUATED and creates a DeliverableEvaluation record.
   */
  async evaluate(
    deliverable: UserDeliverable,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Fetch the template if linked
      let template: DeliverableTemplate | null = null;
      if (deliverable.templateId) {
        template = await this.prisma.deliverableTemplate.findUnique({
          where: { id: deliverable.templateId },
        });
      }

      const evaluationResult = await this.callAiEvaluation(
        deliverable,
        template,
      );

      // Save evaluation
      await this.prisma.deliverableEvaluation.create({
        data: {
          deliverableId: deliverable.id,
          revisionNumber: deliverable.revisionNumber,
          score: evaluationResult.score,
          grade: evaluationResult.grade,
          positives: evaluationResult.positives,
          improvements: evaluationResult.improvements,
          missingElements: evaluationResult.missingElements,
          incorrectElements: evaluationResult.incorrectElements,
          recommendations: evaluationResult.recommendations,
          pmiOutputsCovered: evaluationResult.pmiOutputsCovered,
          pmiOutputsMissing: evaluationResult.pmiOutputsMissing,
        },
      });

      // Update deliverable status to EVALUATED
      await this.prisma.userDeliverable.update({
        where: { id: deliverable.id },
        data: { status: 'EVALUATED' },
      });

      // Emit event
      this.eventPublisher
        .publish(
          EventType.DELIVERABLE_EVALUATED,
          AggregateType.USER_DELIVERABLE,
          deliverable.id,
          {
            simulationId: deliverable.simulationId,
            title: deliverable.title,
            score: evaluationResult.score,
            grade: evaluationResult.grade,
            revisionNumber: deliverable.revisionNumber,
          },
          {
            actorId: 'system',
            actorType: 'system',
            tenantId,
            receiverIds: [userId],
            channels: ['socket'],
            priority: 2,
          },
        )
        .catch(() => {});

      this.logger.log(
        `Deliverable ${deliverable.id} evaluated: score=${evaluationResult.score}, grade=${evaluationResult.grade}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to evaluate deliverable ${deliverable.id}: ${err.message}`,
        err.stack,
      );
      // Don't throw — this runs in background
    }
  }

  /**
   * Generate a meeting minutes deliverable using AI.
   */
  async generateMeetingMinutes(
    meetingId: string,
    deliverableId: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    try {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { participant: true },
          },
          summary: true,
        },
      });

      if (!meeting) {
        this.logger.warn(`Meeting ${meetingId} not found for minutes generation`);
        return;
      }

      const messagesText = meeting.messages
        .map(
          (m) =>
            `[${m.participant?.name ?? m.role}]: ${m.content}`,
        )
        .join('\n');

      const participantsList = meeting.participants
        .map((p) => `${p.name} (${p.role})`)
        .join(', ');

      const result = await this.aiService.complete({
        prompt: `Genere un compte-rendu de reunion structure en markdown a partir des informations suivantes :

## Informations de la reunion
- **Titre** : ${meeting.title}
- **Type** : ${meeting.type}
- **Objectifs** : ${meeting.objectives.join(', ')}
- **Participants** : ${participantsList}
- **Duree** : ${meeting.durationMinutes} minutes

## Messages echanges
${messagesText}

${meeting.summary ? `## Resume existant\n${meeting.summary.summary}` : ''}

## Instructions
Redige un compte-rendu professionnel incluant :
1. En-tete (date, participants, objectifs)
2. Points abordes
3. Decisions prises
4. Actions a mener (qui, quoi, quand)
5. Points en suspens
6. Prochaines etapes

Reponds uniquement en markdown, en francais.`,
        systemPrompt:
          'Tu es un assistant specialise dans la redaction de comptes-rendus de reunions professionnels. Tu produis des documents structures, precis et exploitables.',
        maxTokens: 3000,
        temperature: 0.5,
        trackingContext: {
          tenantId,
          userId,
          simulationId: meeting.simulationId,
          operation: 'meeting_minutes_generation',
        },
      });

      // Save generated CR in evaluation record
      await this.prisma.deliverableEvaluation.create({
        data: {
          deliverableId,
          revisionNumber: 0,
          score: 0,
          grade: 'N/A',
          positives: [],
          improvements: [],
          missingElements: [],
          incorrectElements: [],
          recommendations: [],
          pmiOutputsCovered: [],
          pmiOutputsMissing: [],
          aiGeneratedCR: result.content,
        },
      });

      this.logger.log(
        `Meeting minutes generated for meeting ${meetingId}, deliverable ${deliverableId}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to generate meeting minutes: ${err.message}`,
        err.stack,
      );
    }
  }

  /**
   * Call AI to evaluate a deliverable.
   */
  private async callAiEvaluation(
    deliverable: UserDeliverable,
    template: DeliverableTemplate | null,
  ): Promise<EvaluationResult> {
    const evaluationCriteria = template?.evaluationCriteria
      ? JSON.stringify(template.evaluationCriteria, null, 2)
      : 'Criteres generiques : exhaustivite, clarte, alignement PMI, qualite redactionnelle';

    const pmiProcess = template?.pmiProcess || 'Non specifie';

    const result = await this.aiService.complete({
      prompt: `Evalue le livrable suivant selon les criteres fournis.

## Livrable
- **Titre** : ${deliverable.title}
- **Type** : ${deliverable.type}
- **Revision** : ${deliverable.revisionNumber}

## Contenu du livrable
${deliverable.content || '(vide)'}

${template ? `## Template de reference\n${template.content}` : ''}

## Criteres d'evaluation
${evaluationCriteria}

## Processus PMI associe
${pmiProcess}

## Instructions
Evalue ce livrable et retourne un JSON avec exactement cette structure :
{
  "score": <nombre entre 0 et 100>,
  "grade": "<A, B, C, D ou F>",
  "positives": ["<points positifs>"],
  "improvements": ["<points a ameliorer>"],
  "missingElements": ["<elements manquants>"],
  "incorrectElements": ["<elements incorrects ou errones>"],
  "recommendations": ["<recommandations pour la prochaine revision>"],
  "pmiOutputsCovered": ["<outputs PMI couverts par ce livrable>"],
  "pmiOutputsMissing": ["<outputs PMI qui devraient etre presents mais sont absents>"]
}

Baremes :
- A (90-100) : Excellent, quasi-professionnel
- B (75-89) : Bon, quelques ameliorations mineures
- C (60-74) : Acceptable, ameliorations significatives necessaires
- D (40-59) : Insuffisant, manques importants
- F (0-39) : Tres insuffisant, a refaire completement

Reponds UNIQUEMENT avec le JSON, sans commentaire ni markdown.`,
      systemPrompt:
        'Tu es un evaluateur PMI expert et pedagogue. Tu evalues les livrables de gestion de projet selon les standards PMBOK 7eme edition. Tu es exigeant mais constructif. Reponds toujours en francais. Reponds UNIQUEMENT avec le JSON demande.',
      maxTokens: 2000,
      temperature: 0.3,
      trackingContext: {
        tenantId: deliverable.simulationId, // will be overridden
        userId: '',
        simulationId: deliverable.simulationId,
        operation: 'deliverable_evaluation',
      },
    });

    try {
      // Parse the JSON response (handle potential markdown wrapping)
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '');
      }
      const parsed = JSON.parse(jsonStr) as EvaluationResult;

      // Validate and clamp score
      parsed.score = Math.max(0, Math.min(100, parsed.score));

      // Ensure grade is valid
      const validGrades = ['A', 'B', 'C', 'D', 'F'];
      if (!validGrades.includes(parsed.grade)) {
        parsed.grade = this.scoreToGrade(parsed.score);
      }

      // Ensure arrays
      parsed.positives = parsed.positives ?? [];
      parsed.improvements = parsed.improvements ?? [];
      parsed.missingElements = parsed.missingElements ?? [];
      parsed.incorrectElements = parsed.incorrectElements ?? [];
      parsed.recommendations = parsed.recommendations ?? [];
      parsed.pmiOutputsCovered = parsed.pmiOutputsCovered ?? [];
      parsed.pmiOutputsMissing = parsed.pmiOutputsMissing ?? [];

      return parsed;
    } catch (parseErr: any) {
      this.logger.warn(
        `Failed to parse AI evaluation response: ${parseErr.message}. Using fallback.`,
      );
      return {
        score: 50,
        grade: 'D',
        positives: ['Le livrable a ete soumis'],
        improvements: [
          'Impossible d\'evaluer automatiquement. Veuillez reessayer.',
        ],
        missingElements: [],
        incorrectElements: [],
        recommendations: [
          'Verifiez que le contenu est bien structure et complet.',
        ],
        pmiOutputsCovered: [],
        pmiOutputsMissing: [],
      };
    }
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
}
