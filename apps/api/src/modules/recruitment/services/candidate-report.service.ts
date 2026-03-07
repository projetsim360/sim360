import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class CandidateReportService {
  private readonly logger = new Logger(CandidateReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly aiService: AiService,
  ) {}

  async generateReport360(candidateResultId: string, tenantId: string, recruiterId: string) {
    const candidate = await this.prisma.candidateResult.findUnique({
      where: { id: candidateResultId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        campaign: {
          select: {
            id: true,
            tenantId: true,
            title: true,
            jobTitle: true,
            jobDescription: true,
            requiredSkills: true,
            experienceLevel: true,
            culture: true,
          },
        },
        simulation: {
          include: {
            kpis: true,
            decisions: { orderBy: { phaseOrder: 'asc' as const } },
            randomEvents: { orderBy: { phaseOrder: 'asc' as const } },
            meetings: {
              include: {
                summary: true,
                messages: {
                  orderBy: { createdAt: 'asc' as const },
                  take: 50,
                },
                _count: { select: { messages: true } },
              },
            },
            phases: { orderBy: { order: 'asc' as const } },
          },
        },
      },
    });

    if (!candidate) throw new NotFoundException('Candidat introuvable');
    if (candidate.campaign.tenantId !== tenantId) throw new BadRequestException('Acces refuse');
    if (candidate.status !== 'COMPLETED') {
      throw new BadRequestException('Le candidat doit avoir termine la simulation');
    }

    const skills = candidate.campaign.requiredSkills as Array<{ skill: string; weight: number }>;
    const simulation = candidate.simulation;

    const systemPrompt = `Tu es un expert en evaluation de competences et recrutement. Tu analyses les performances d'un candidat dans une simulation de gestion de projet pour generer un rapport d'aptitude complet (rapport 360).

Tu dois evaluer :
1. Les competences techniques (hard skills) : qualite des decisions, gestion du budget/delai/qualite
2. Les competences comportementales (soft skills) : communication en reunion, gestion d'equipe, leadership
3. La fiabilite : respect des engagements, coherence des decisions
4. L'adaptabilite : reaction aux evenements imprevus, gestion des crises
5. Le leadership : prise d'initiative, influence sur l'equipe

Reponds UNIQUEMENT avec un JSON valide (sans markdown).`;

    const decisionsSummary = simulation?.decisions.map((d) => ({
      title: d.title,
      selectedOption: d.selectedOption,
      kpiImpact: d.kpiImpact,
      phaseOrder: d.phaseOrder,
    })) ?? [];

    const eventsSummary = simulation?.randomEvents.map((e) => ({
      title: e.title,
      severity: e.severity,
      selectedOption: e.selectedOption,
      resolved: !!e.resolvedAt,
      kpiImpact: e.kpiImpact,
    })) ?? [];

    const meetingsSummary = simulation?.meetings.map((m) => ({
      title: m.title,
      type: m.type,
      status: m.status,
      messageCount: m._count.messages,
      summary: m.summary,
    })) ?? [];

    const kpis = simulation?.kpis;

    const prompt = `Analyse les performances du candidat ${candidate.user.firstName} ${candidate.user.lastName} pour le poste "${candidate.campaign.jobTitle}".

**Competences requises** : ${skills.map((s) => `${s.skill} (poids: ${s.weight})`).join(', ')}
**Niveau requis** : ${candidate.campaign.experienceLevel}
**Culture** : ${candidate.campaign.culture}

**KPIs finaux** :
- Budget: ${kpis?.budget ?? 'N/A'}%
- Delai: ${kpis?.schedule ?? 'N/A'}%
- Qualite: ${kpis?.quality ?? 'N/A'}%
- Moral equipe: ${kpis?.teamMorale ?? 'N/A'}%
- Niveau de risque: ${kpis?.riskLevel ?? 'N/A'}%

**Decisions prises** (${decisionsSummary.length}) : ${JSON.stringify(decisionsSummary)}

**Evenements geres** (${eventsSummary.length}) : ${JSON.stringify(eventsSummary)}

**Reunions** (${meetingsSummary.length}) : ${JSON.stringify(meetingsSummary)}

**Duree totale** : ${simulation?.totalDurationMinutes ?? 'N/A'} minutes

Reponds avec ce JSON :
{
  "hardSkillsScore": number (0-100),
  "softSkillsScore": number (0-100),
  "reliabilityScore": number (0-100),
  "adaptabilityScore": number (0-100),
  "leadershipScore": number (0-100),
  "globalScore": number (0-100),
  "matchPercentage": number (0-100),
  "strengths": ["string (max 5)"],
  "weaknesses": ["string (max 5)"],
  "aiJustification": "string (300-500 mots, analyse detaillee)",
  "competencyScores": { "competenceName": number (0-100) },
  "detailedAnalysis": {
    "decisionQuality": "string (analyse des decisions)",
    "communicationSkills": "string (analyse de la communication)",
    "crisisManagement": "string (analyse de la gestion de crise)",
    "timeManagement": "string (analyse de la gestion du temps)",
    "teamManagement": "string (analyse de la gestion d'equipe)"
  },
  "recommendation": "STRONGLY_RECOMMEND|RECOMMEND|NEUTRAL|NOT_RECOMMEND"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 4000,
      temperature: 0.6,
      trackingContext: {
        tenantId,
        userId: recruiterId,
        operation: 'recruitment.generate_report360',
        metadata: { candidateResultId, campaignId: candidate.campaignId },
      },
    });

    let report: any;
    try {
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      report = JSON.parse(jsonStr);
    } catch {
      this.logger.error(`Failed to parse AI report response: ${result.content.substring(0, 200)}`);
      throw new BadRequestException('Echec de la generation du rapport. Veuillez reessayer.');
    }

    // Update candidate result with scores and report
    const updated = await this.prisma.candidateResult.update({
      where: { id: candidateResultId },
      data: {
        globalScore: report.globalScore,
        hardSkillsScore: report.hardSkillsScore,
        softSkillsScore: report.softSkillsScore,
        reliabilityScore: report.reliabilityScore,
        adaptabilityScore: report.adaptabilityScore,
        leadershipScore: report.leadershipScore,
        competencyScores: report.competencyScores,
        matchPercentage: report.matchPercentage,
        strengths: report.strengths ?? [],
        weaknesses: report.weaknesses ?? [],
        aiJustification: report.aiJustification,
        report360: report,
      },
    });

    await this.eventPublisher.publish(
      EventType.CANDIDATE_REPORT_GENERATED,
      AggregateType.CANDIDATE_RESULT,
      candidateResultId,
      {
        candidateName: `${candidate.user.firstName} ${candidate.user.lastName}`,
        campaignTitle: candidate.campaign.title,
        globalScore: report.globalScore,
      },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 2 },
    );

    return updated;
  }

  async generateShortlist(campaignId: string, tenantId: string, recruiterId: string, count = 10) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        tenantId: true,
        title: true,
        jobTitle: true,
        requiredSkills: true,
        experienceLevel: true,
      },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.tenantId !== tenantId) throw new BadRequestException('Acces refuse');

    const candidates = await this.prisma.candidateResult.findMany({
      where: { campaignId, status: 'COMPLETED' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { globalScore: 'desc' },
    });

    if (candidates.length === 0) {
      throw new BadRequestException('Aucun candidat n\'a termine la simulation');
    }

    const skills = campaign.requiredSkills as Array<{ skill: string; weight: number }>;

    const systemPrompt = `Tu es un expert en recrutement. Tu generes une short-list de candidats en justifiant le classement. Reponds UNIQUEMENT avec un JSON valide.`;

    const prompt = `Genere une short-list de ${Math.min(count, candidates.length)} candidats pour le poste "${campaign.jobTitle}".

**Competences requises** : ${skills.map((s) => `${s.skill} (poids: ${s.weight})`).join(', ')}

**Candidats** :
${candidates.map((c) => `- ${c.user.firstName} ${c.user.lastName} (ID: ${c.id}) — Score global: ${c.globalScore ?? 'N/A'}, Hard: ${c.hardSkillsScore ?? 'N/A'}, Soft: ${c.softSkillsScore ?? 'N/A'}, Match: ${c.matchPercentage ?? 'N/A'}%, Forces: ${c.strengths.join(', ')}, Faiblesses: ${c.weaknesses.join(', ')}`).join('\n')}

Reponds avec :
{
  "shortlist": [
    {
      "candidateId": "string",
      "rank": number,
      "candidateName": "string",
      "globalScore": number,
      "matchPercentage": number,
      "justification": "string (2-3 phrases)"
    }
  ],
  "summary": "string (analyse globale du vivier de candidats)"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 3000,
      temperature: 0.5,
      trackingContext: {
        tenantId,
        userId: recruiterId,
        operation: 'recruitment.generate_shortlist',
        metadata: { campaignId },
      },
    });

    let shortlist: any;
    try {
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      shortlist = JSON.parse(jsonStr);
    } catch {
      this.logger.error(`Failed to parse AI shortlist response`);
      throw new BadRequestException('Echec de la generation de la short-list. Veuillez reessayer.');
    }

    await this.eventPublisher.publish(
      EventType.SHORTLIST_GENERATED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      campaignId,
      { campaignTitle: campaign.title, count: shortlist.shortlist?.length ?? 0 },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket', 'email'], priority: 2 },
    );

    return shortlist;
  }

  async compareCandidates(
    campaignId: string,
    candidateIdA: string,
    candidateIdB: string,
    tenantId: string,
    recruiterId: string,
  ) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, tenantId: true, title: true, jobTitle: true, requiredSkills: true },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.tenantId !== tenantId) throw new BadRequestException('Acces refuse');

    const [candidateA, candidateB] = await Promise.all([
      this.prisma.candidateResult.findUnique({
        where: { id: candidateIdA },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.candidateResult.findUnique({
        where: { id: candidateIdB },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    if (!candidateA || !candidateB) throw new NotFoundException('Candidat introuvable');
    if (candidateA.campaignId !== campaignId || candidateB.campaignId !== campaignId) {
      throw new BadRequestException('Les deux candidats doivent appartenir a cette campagne');
    }

    const systemPrompt = `Tu es un expert en recrutement. Tu compares deux candidats de maniere objective et detaillee. Reponds UNIQUEMENT avec un JSON valide.`;

    const skills = campaign.requiredSkills as Array<{ skill: string; weight: number }>;

    const prompt = `Compare ces deux candidats pour le poste "${campaign.jobTitle}".

**Competences requises** : ${skills.map((s) => `${s.skill} (poids: ${s.weight})`).join(', ')}

**Candidat A** : ${candidateA.user.firstName} ${candidateA.user.lastName}
- Score global: ${candidateA.globalScore ?? 'N/A'}, Match: ${candidateA.matchPercentage ?? 'N/A'}%
- Hard skills: ${candidateA.hardSkillsScore ?? 'N/A'}, Soft skills: ${candidateA.softSkillsScore ?? 'N/A'}
- Fiabilite: ${candidateA.reliabilityScore ?? 'N/A'}, Adaptabilite: ${candidateA.adaptabilityScore ?? 'N/A'}, Leadership: ${candidateA.leadershipScore ?? 'N/A'}
- Forces: ${candidateA.strengths.join(', ')}
- Faiblesses: ${candidateA.weaknesses.join(', ')}

**Candidat B** : ${candidateB.user.firstName} ${candidateB.user.lastName}
- Score global: ${candidateB.globalScore ?? 'N/A'}, Match: ${candidateB.matchPercentage ?? 'N/A'}%
- Hard skills: ${candidateB.hardSkillsScore ?? 'N/A'}, Soft skills: ${candidateB.softSkillsScore ?? 'N/A'}
- Fiabilite: ${candidateB.reliabilityScore ?? 'N/A'}, Adaptabilite: ${candidateB.adaptabilityScore ?? 'N/A'}, Leadership: ${candidateB.leadershipScore ?? 'N/A'}
- Forces: ${candidateB.strengths.join(', ')}
- Faiblesses: ${candidateB.weaknesses.join(', ')}

Reponds avec :
{
  "winner": "A|B|TIE",
  "scoreComparison": {
    "global": { "a": number, "b": number },
    "hardSkills": { "a": number, "b": number },
    "softSkills": { "a": number, "b": number },
    "reliability": { "a": number, "b": number },
    "adaptability": { "a": number, "b": number },
    "leadership": { "a": number, "b": number }
  },
  "advantages": {
    "candidateA": ["string"],
    "candidateB": ["string"]
  },
  "analysis": "string (200-300 mots, analyse comparative detaillee)",
  "recommendation": "string (conseil final pour le recruteur)"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.5,
      trackingContext: {
        tenantId,
        userId: recruiterId,
        operation: 'recruitment.compare_candidates',
        metadata: { campaignId, candidateIdA, candidateIdB },
      },
    });

    let comparison: any;
    try {
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      comparison = JSON.parse(jsonStr);
    } catch {
      throw new BadRequestException('Echec de la comparaison. Veuillez reessayer.');
    }

    await this.eventPublisher.publish(
      EventType.CANDIDATE_COMPARED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      campaignId,
      {
        candidateA: `${candidateA.user.firstName} ${candidateA.user.lastName}`,
        candidateB: `${candidateB.user.firstName} ${candidateB.user.lastName}`,
        winner: comparison.winner,
      },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
    );

    return {
      candidateA: {
        id: candidateA.id,
        name: `${candidateA.user.firstName} ${candidateA.user.lastName}`,
      },
      candidateB: {
        id: candidateB.id,
        name: `${candidateB.user.firstName} ${candidateB.user.lastName}`,
      },
      ...comparison,
    };
  }

  async generateInterviewGuide(candidateResultId: string, tenantId: string, recruiterId: string) {
    const candidate = await this.prisma.candidateResult.findUnique({
      where: { id: candidateResultId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        campaign: {
          select: {
            tenantId: true,
            title: true,
            jobTitle: true,
            requiredSkills: true,
            culture: true,
          },
        },
      },
    });

    if (!candidate) throw new NotFoundException('Candidat introuvable');
    if (candidate.campaign.tenantId !== tenantId) throw new BadRequestException('Acces refuse');

    const skills = candidate.campaign.requiredSkills as Array<{ skill: string; weight: number }>;

    const systemPrompt = `Tu es un expert en recrutement et en entretien d'embauche. Tu generes un guide d'entretien personnalise base sur les performances du candidat en simulation. Reponds UNIQUEMENT avec un JSON valide.`;

    const prompt = `Genere un guide d'entretien pour ${candidate.user.firstName} ${candidate.user.lastName}, candidat au poste "${candidate.campaign.jobTitle}".

**Competences evaluees** : ${skills.map((s) => `${s.skill} (poids: ${s.weight})`).join(', ')}
**Culture** : ${candidate.campaign.culture}

**Resultats de simulation** :
- Score global: ${candidate.globalScore ?? 'N/A'}
- Hard skills: ${candidate.hardSkillsScore ?? 'N/A'}, Soft skills: ${candidate.softSkillsScore ?? 'N/A'}
- Fiabilite: ${candidate.reliabilityScore ?? 'N/A'}, Adaptabilite: ${candidate.adaptabilityScore ?? 'N/A'}, Leadership: ${candidate.leadershipScore ?? 'N/A'}
- Match: ${candidate.matchPercentage ?? 'N/A'}%
- Forces: ${candidate.strengths.join(', ')}
- Faiblesses: ${candidate.weaknesses.join(', ')}
${candidate.aiJustification ? `- Analyse IA: ${candidate.aiJustification}` : ''}

Genere entre 5 et 10 questions d'entretien personnalisees, en ciblant les zones de doute et les points a approfondir.

Reponds avec :
{
  "questions": [
    {
      "question": "string",
      "category": "hard_skills|soft_skills|reliability|adaptability|leadership|culture_fit",
      "targetedWeakness": "string|null",
      "expectedAnswer": "string (indices pour le recruteur)",
      "followUpQuestions": ["string"]
    }
  ],
  "interviewStrategy": "string (conseils pour mener l'entretien)",
  "redFlags": ["string (signaux d'alerte a surveiller)"],
  "positiveSignals": ["string (points a confirmer)"]
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 3000,
      temperature: 0.6,
      trackingContext: {
        tenantId,
        userId: recruiterId,
        operation: 'recruitment.generate_interview_guide',
        metadata: { candidateResultId, campaignId: candidate.campaignId },
      },
    });

    let guide: any;
    try {
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      guide = JSON.parse(jsonStr);
    } catch {
      throw new BadRequestException('Echec de la generation du guide. Veuillez reessayer.');
    }

    // Save the interview guide on the candidate result
    await this.prisma.candidateResult.update({
      where: { id: candidateResultId },
      data: { interviewGuide: guide },
    });

    await this.eventPublisher.publish(
      EventType.INTERVIEW_GUIDE_GENERATED,
      AggregateType.CANDIDATE_RESULT,
      candidateResultId,
      {
        candidateName: `${candidate.user.firstName} ${candidate.user.lastName}`,
        campaignTitle: candidate.campaign.title,
      },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
    );

    return guide;
  }
}
