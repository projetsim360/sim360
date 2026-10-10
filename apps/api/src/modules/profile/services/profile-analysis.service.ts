import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import { ProfileType } from '@prisma/client';
import { AiService } from '@/modules/ai/ai.service';
import { SubmitAptitudeTestDto } from '../dto';

interface SkillGap {
  name: string;
  currentLevel: 'none' | 'basic' | 'intermediate' | 'advanced';
  targetLevel: string;
  gap: number;
}

export interface DiagnosticResult {
  profileType: ProfileType;
  skills: SkillGap[];
  suggestedSector: string;
  suggestedDifficulty: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

@Injectable()
export class ProfileAnalysisService {
  private readonly logger = new Logger(ProfileAnalysisService.name);

  private extractJson(raw: string): string {
    // Strip markdown code fences if present
    const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    return fenceMatch ? fenceMatch[1].trim() : raw.trim();
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Submit aptitude test answers: store them and trigger AI evaluation.
   */
  async submitAptitudeTest(
    userId: string,
    tenantId: string,
    dto: SubmitAptitudeTestDto,
  ) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.tenantId !== tenantId) {
      throw new BadRequestException('Profil introuvable');
    }

    // Evaluate aptitude test via AI
    const evaluationResult = await this.aiService.complete({
      prompt: `Évalue les réponses suivantes au test d'aptitude en gestion de projet.

Réponses :
${JSON.stringify(dto.answers, null, 2)}

Analyse chaque réponse et fournis un résultat structure au format JSON :
{
  "score": <number 0-100>,
  "categoryScores": {
    "planification": <number 0-100>,
    "communication": <number 0-100>,
    "gestionRisques": <number 0-100>,
    "leadership": <number 0-100>,
    "gestionBudget": <number 0-100>
  },
  "analysis": "<string: analyse détaillée>",
  "recommendations": ["<string>"]
}

Réponds UNIQUEMENT avec le JSON, sans commentaire.`,
      systemPrompt: `Tu es un expert en évaluation des compétences en gestion de projet. Tu évalues les réponses d'un candidat à un test d'aptitude et fournis une analyse détaillée. Réponds toujours en JSON valide. Réponds en français correct, avec les accents.`,
      maxTokens: 1500,
      temperature: 0.3,
      trackingContext: {
        tenantId,
        userId,
        operation: 'profile_aptitude_evaluation',
      },
    });

    let aptitudeTestData: Record<string, unknown>;
    try {
      aptitudeTestData = JSON.parse(this.extractJson(evaluationResult.content));
    } catch {
      this.logger.warn('Failed to parse aptitude test AI response, storing raw');
      aptitudeTestData = {
        answers: dto.answers,
        rawAnalysis: evaluationResult.content,
      };
    }

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        aptitudeTestData: aptitudeTestData as any,
        onboardingStep: 'aptitude_test_completed',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_APTITUDE_TEST_COMPLETED,
        AggregateType.USER_PROFILE,
        profile.id,
        { hasAptitudeTest: true },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Trigger AI gap analysis using all available profile data.
   * Determines profileType, skills gaps, suggested sector and difficulty.
   */
  async analyze(userId: string, tenantId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.tenantId !== tenantId) {
      throw new BadRequestException('Profil introuvable');
    }

    // Build context from all available data
    const contextParts: string[] = [];

    if (profile.cvData) {
      contextParts.push(`## Données du CV\n${JSON.stringify(profile.cvData, null, 2)}`);
    }

    if (profile.linkedinData) {
      contextParts.push(`## Données LinkedIn\n${JSON.stringify(profile.linkedinData, null, 2)}`);
    }

    if (profile.questionnaireData) {
      contextParts.push(`## Réponses au questionnaire\n${JSON.stringify(profile.questionnaireData, null, 2)}`);
    }

    if (profile.aptitudeTestData) {
      contextParts.push(`## Résultats du test d'aptitude\n${JSON.stringify(profile.aptitudeTestData, null, 2)}`);
    }

    if (contextParts.length === 0) {
      throw new BadRequestException(
        'Aucune donnée disponible pour générer un diagnostic. Veuillez remplir au moins le questionnaire.',
      );
    }

    const dataContext = contextParts.join('\n\n');

    const diagnosticResult = await this.aiService.complete({
      prompt: `Analyse le profil suivant et génère un diagnostic complet.

${dataContext}

Génère un diagnostic au format JSON strict :
{
  "profileType": "ZERO_EXPERIENCE" | "BEGINNER" | "RECONVERSION" | "REINFORCEMENT",
  "skills": [
    {
      "name": "<nom de la compétence>",
      "currentLevel": "none" | "basic" | "intermediate" | "advanced",
      "targetLevel": "basic" | "intermediate" | "advanced",
      "gap": <number 0-100>
    }
  ],
  "suggestedSector": "<secteur d'activité recommandé>",
  "suggestedDifficulty": "EASY" | "MEDIUM" | "HARD" | "EXPERT",
  "summary": "<résumé du diagnostic en 2-3 phrases>",
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "areasForImprovement": ["<axe d'amélioration 1>", "<axe d'amélioration 2>"]
}

Règles pour déterminer profileType :
- ZERO_EXPERIENCE : aucune expérience en gestion de projet, débutant complet
- BEGINNER : quelques notions, < 1 an d'expérience
- RECONVERSION : expérience dans un autre domaine, souhaite se reconvertir en gestion de projet
- REINFORCEMENT : expérience existante en gestion de projet, souhaite renforcer ses compétences

Les compétences doivent couvrir : planification, gestion des risques, communication, leadership, gestion budgétaire, méthodologie (PMI/Agile), gestion des parties prenantes, suivi et contrôle.

Le gap est calculé comme : (targetLevel - currentLevel) / targetLevel * 100.

Réponds UNIQUEMENT avec le JSON, sans commentaire.`,
      systemPrompt: `Tu es un expert en analyse de profils pour la gestion de projet. Tu détermines le type de profil d'un apprenant et identifies ses lacunes (gap analysis) pour personnaliser son parcours de formation via simulation. Réponds toujours en JSON valide. Réponds en français correct, avec les accents.`,
      maxTokens: 2000,
      temperature: 0.3,
      trackingContext: {
        tenantId,
        userId,
        operation: 'profile_gap_analysis',
      },
    });

    let diagnostic: DiagnosticResult;
    try {
      diagnostic = JSON.parse(this.extractJson(diagnosticResult.content));
    } catch {
      this.logger.error('Failed to parse diagnostic AI response');
      throw new BadRequestException(
        'Erreur lors de la génération du diagnostic. Veuillez réessayer.',
      );
    }

    // Validate profileType
    const validProfileTypes: ProfileType[] = [
      ProfileType.ZERO_EXPERIENCE,
      ProfileType.BEGINNER,
      ProfileType.RECONVERSION,
      ProfileType.REINFORCEMENT,
    ];

    if (!validProfileTypes.includes(diagnostic.profileType as ProfileType)) {
      this.logger.warn(`Invalid profileType from AI: ${diagnostic.profileType}, defaulting to BEGINNER`);
      diagnostic.profileType = ProfileType.BEGINNER;
    }

    // Persist diagnostic
    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        profileType: diagnostic.profileType as ProfileType,
        diagnosticData: diagnostic as any,
        skills: diagnostic.skills as any,
        suggestedSector: diagnostic.suggestedSector,
        suggestedDifficulty: diagnostic.suggestedDifficulty,
        onboardingStep: 'diagnostic_generated',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_DIAGNOSTIC_GENERATED,
        AggregateType.USER_PROFILE,
        profile.id,
        {
          profileType: diagnostic.profileType,
          suggestedSector: diagnostic.suggestedSector,
          suggestedDifficulty: diagnostic.suggestedDifficulty,
          skillCount: diagnostic.skills.length,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return {
      profile: updated,
      diagnostic,
    };
  }

  /**
   * Extract CV data via AI from the uploaded file URL.
   * Called internally after CV upload.
   */
  async extractCvData(userId: string, tenantId: string, fileUrl: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.tenantId !== tenantId) {
      throw new BadRequestException('Profil introuvable');
    }

    const extractionResult = await this.aiService.complete({
      prompt: `Un CV a été uploade a l'URL suivante : ${fileUrl}

Comme tu ne peux pas accéder au fichier directement, génère une structure JSON vide à remplir manuellement par l'apprenant. Le format attendu est :

{
  "fullName": "",
  "email": "",
  "phone": "",
  "currentPosition": "",
  "yearsOfExperience": 0,
  "education": [
    { "degree": "", "institution": "", "year": null }
  ],
  "experience": [
    { "title": "", "company": "", "duration": "", "description": "" }
  ],
  "certifications": [],
  "languages": [],
  "technicalSkills": [],
  "managementSkills": [],
  "projectManagementExperience": {
    "hasExperience": false,
    "methodologies": [],
    "tools": [],
    "largestTeamSize": 0,
    "largestBudget": ""
  }
}

Réponds UNIQUEMENT avec le JSON.`,
      systemPrompt: `Tu es un expert en analyse de CV. Tu extrais les informations pertinentes d'un CV pour évaluer le profil d'un apprenant en gestion de projet. Réponds en français correct, avec les accents.`,
      maxTokens: 1500,
      temperature: 0.2,
      trackingContext: {
        tenantId,
        userId,
        operation: 'profile_cv_extraction',
      },
    });

    let cvData: Record<string, unknown>;
    try {
      cvData = JSON.parse(this.extractJson(extractionResult.content));
    } catch {
      this.logger.warn('Failed to parse CV extraction AI response');
      cvData = { rawExtraction: extractionResult.content, fileUrl };
    }

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        cvData: cvData as any,
      },
    });

    return updated;
  }
}
