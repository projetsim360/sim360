import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '@/modules/ai/ai.service';
import {
  Simulation,
  Scenario,
  SimulatedEmail,
  RandomEvent,
} from '@prisma/client';

interface GeneratedEmail {
  senderName: string;
  senderRole: string;
  senderEmail: string;
  subject: string;
  body: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
}

interface ResponseEvaluation {
  score: number;
  feedback: string;
}

type SimulationWithScenario = Simulation & { scenario: Scenario };

const PHASE_NAMES: Record<number, string> = {
  1: 'Initiation',
  2: 'Planification',
  3: 'Exécution',
  4: 'Surveillance et Maîtrise',
  5: 'Clôture',
};

@Injectable()
export class EmailGeneratorService {
  private readonly logger = new Logger(EmailGeneratorService.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * Generate a welcome email from DRH for the beginning of the simulation.
   * The email serves as a "Project Handbook" with PMBOK/PMI methodology content,
   * governance structure, standard procedures, and available tools.
   */
  async generateWelcomeEmail(
    simulation: SimulationWithScenario,
    tenantId: string,
    userId: string,
  ): Promise<GeneratedEmail> {
    const projectTemplate = simulation.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    const isBrownfield = simulation.scenario.scenarioType === 'BROWNFIELD';
    const brownfieldContext = isBrownfield
      ? (simulation.scenario.brownfieldContext as Record<string, unknown> | null)
      : null;

    const systemPrompt = `Tu es un générateur d'emails professionnels réalistes pour une simulation de gestion de projet.
Tu génères des emails en français, avec un ton professionnel adapté au rôle de l'expéditeur.
Le contenu du body doit être en format Markdown structure avec des titres (##), sous-titres (###), listes à puces, et mise en gras (**texte**).
Tu dois retourner un JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const brownfieldSection = brownfieldContext
      ? `

## SECTION SUPPLÉMENTAIRE OBLIGATOIRE — État actuel du projet (BROWNFIELD)
Comme il s'agit d'un projet en reprise (brownfield), tu DOIS ajouter une section "## État actuel du projet" après la section Bienvenue, incluant :
- Décisions précédentes prises : ${JSON.stringify(brownfieldContext.previousDecisions || [])}
- Livrables déjà completes : ${JSON.stringify(brownfieldContext.completedDeliverables || [])}
- Retards accumulés : ${brownfieldContext.accumulatedDelays || 'non communiqué'}
- Budget consommé : ${brownfieldContext.budgetUsed || 'non communiqué'}
- Risques connus : ${JSON.stringify(brownfieldContext.knownRisks || [])}
- Moral de l'équipe : ${brownfieldContext.teamMorale || 'non communiqué'}
- Notes du précédent chef de projet : ${brownfieldContext.previousPmNotes || 'aucune'}

Cette section doit expliquer clairement la situation héritée, les défis en cours, et les points d'attention prioritaires pour le nouveau chef de projet.`
      : '';

    const prompt = `Génère un email de bienvenue complet envoyé par la DRH au nouveau chef de projet.
Cet email sert de "Guide du Projet" (Project Handbook) et doit être un document de référence complet.

Contexte du scénario :
- Entreprise/Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Description : ${simulation.scenario.description || 'Projet de gestion'}
- Culture d'entreprise : ${projectTemplate.culture || 'professionnelle'}
- Objectifs : ${simulation.scenario.objectives?.join(', ') || 'Gestion de projet'}
- Taille de l'équipe : ${projectTemplate.teamSize || 'non définie'}
- Budget initial : ${projectTemplate.initialBudget || 'non défini'}
- Deadline : ${projectTemplate.deadlineDays || 'non définie'} jours
- Difficulté : ${simulation.scenario.difficulty}
- Type de scénario : ${simulation.scenario.scenarioType}
- Compétences visées : ${simulation.scenario.competencies?.join(', ') || 'gestion de projet'}

Le body de l'email DOIT être en Markdown et DOIT contenir les 7 sections suivantes dans cet ordre exact :

## 1. Bienvenue
- Accueil chaleureux et personnalise de la part de la DRH
- Présentation de l'entreprise, son secteur, sa culture
- Contexte du projet et pourquoi le chef de projet a été choisi
- Ton adapté à la culture d'entreprise (formel si culture formelle, décontracté si startup/agile)
${isBrownfield ? '\n## 2. État actuel du projet\n- Synthèse claire de la situation héritée (retards, budget, risques, moral de l\'équipe)\n- Points d\'attention prioritaires\n- Décisions précédentes à connaître\n- Livrables déjà complétés et ceux en cours' : ''}

## ${isBrownfield ? '3' : '2'}. Méthodologie Projet (PMBOK/PMI)
Présenter les 5 groupes de processus PMI que le chef de projet devra suivre :
- **Initiation** : Définition du projet, identification des parties prenantes, charte de projet
- **Planification** : Élaboration du plan de management (scope, échéancier, coûts, qualité, ressources, communications, risques, approvisionnements)
- **Exécution** : Direction et gestion du travail, management de l'équipe, communication avec les parties prenantes
- **Surveillance et Maîtrise** : Suivi de l'avancement, contrôle des changements, gestion des écarts (coût, délai, qualité)
- **Clôture** : Recette finale, bilan de projet, leçons apprises, archivage, libération des ressources

## ${isBrownfield ? '4' : '3'}. Gouvernance
Décrire la structure de gouvernance du projet :
- **Sponsor** : Qui est-il, son rôle (validation budget, arbitrages stratégiques)
- **Chef de Projet (vous)** : Vos responsabilités (planification, coordination, reporting, gestion des risques)
- **Équipe Projet** : Composition, rôles attendus, règles de fonctionnement
- **PMO** : Rôle d'accompagnement, support méthodologique, suivi des KPIs
- **Processus d'escalade** : Quand et comment escalader (niveaux de décision)
- **Niveaux d'autorite** : Ce que le chef de projet peut décider seul vs. ce qui nécessite validation

## ${isBrownfield ? '5' : '4'}. Procédures Standards
Détailler les 4 procédures clés :

### Gestion des changements
- Processus de demande de changement (change request)
- Analyse d'impact obligatoire (scope, budget, délai, qualité)
- Circuit de validation selon l'ampleur du changement

### Gestion des risques
- Identification continue des risques
- Analyse qualitative et quantitative
- Plan de réponse (éviter, transférer, attenuer, accepter)
- Suivi dans le registre des risques

### Gestion de la qualité
- Critères d'acceptation des livrables
- Processus de revue et validation
- Normes de qualité applicables au secteur

### Communication
- Fréquence des réunions (comite de pilotage, stand-up, rétrospective)
- Rapports d'avancement attendus
- Canaux de communication (email, réunions, messagerie)

## ${isBrownfield ? '6' : '5'}. Outils à votre disposition
Présenter les outils disponibles dans la plateforme :
- **Agent PMO IA** : Assistant intelligent pour poser des questions méthodologiques, obtenir des conseils, analyser vos décisions
- **Éditeur de livrables** : Outil pour rédiger et soumettre vos livrables (charte projet, plan de management, rapports, etc.) avec évaluation automatique
- **Réunions virtuelles** : Système de réunions avec des participants IA (client, équipe, sponsor) en mode texte ou audio
- **Tableaux de bord KPIs** : Suivi en temps réel de vos indicateurs (budget, échéancier, qualité, moral équipe, niveau de risque)
- **Boîte de réception** : Emails simulés de parties prenantes nécessitant vos réponses et décisions

## ${isBrownfield ? '7' : '6'}. Contacts clés
Générer 4-5 contacts fictifs réalistes avec :
- Nom, rôle, email, et dans quel cas les contacter
- Au minimum : Sponsor/DG, Client, Responsable technique, DRH, PMO

## ${isBrownfield ? '8' : '7'}. Prochaines étapes
Lister 5-6 actions concrètes que le chef de projet doit accomplir en premier :
- Consulter les documents du projet
- Organiser une réunion de lancement (kick-off)
- Identifier les parties prenantes
- Rédiger la charte de projet
- Prendre connaissance des KPIs initiaux
- Contacter l'équipe projet
${isBrownfield ? '- Analyser la situation héritée et identifier les actions correctives prioritaires' : ''}
${brownfieldSection}

IMPORTANT : Le body doit être long et détaille (environ 2000-3000 mots). C'est un document de référence que l'apprenant consultera tout au long de la simulation.
Adapte le vocabulaire et les exemples au secteur "${simulation.scenario.sector}" et a la difficulté "${simulation.scenario.difficulty}".

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prénom Nom",
  "senderRole": "DRH",
  "senderEmail": "prenom.nom@entreprise.com",
  "subject": "Bienvenue - Guide du Projet [nom du projet]",
  "body": "Contenu complet en Markdown avec toutes les sections demandées",
  "priority": "NORMAL"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 8000,
      temperature: 0.7,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_generate_welcome',
      },
    });

    return this.parseGeneratedEmail(result.content);
  }

  /**
   * Generate 2-4 emails for a given phase from various stakeholders.
   */
  async generatePhaseEmails(
    simulation: SimulationWithScenario,
    phaseOrder: number,
    tenantId: string,
    userId: string,
  ): Promise<GeneratedEmail[]> {
    const projectTemplate = simulation.scenario.projectTemplate as Record<
      string,
      unknown
    >;
    const phaseName = PHASE_NAMES[phaseOrder] || `Phase ${phaseOrder}`;

    const systemPrompt = `Tu es un générateur d'emails professionnels réalistes pour une simulation de gestion de projet.
Tu génères des emails en français qui simulent des communications réelles reçues par un chef de projet.
Chaque email doit avoir un expéditeur différent avec une personnalité distincte :
- Client : exigeant, pose des questions, demande des comptes rendus
- Fournisseur : technique, informe sur les livraisons/problèmes
- Membre d'équipe : collégial, remonte des problèmes ou partage des avancées
- Sponsor/DG : stratégique, demande des synthèses, rappelle les enjeux business
- DRH : administratif, rappelle les processus, informe sur les équipes

Les emails doivent nécessiter une action ou une décision de la part de l'apprenant.
Tu dois retourner un tableau JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const prompt = `Génère entre 2 et 4 emails professionnels pour la phase "${phaseName}" (phase ${phaseOrder}/5) du projet.

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Difficulté : ${simulation.scenario.difficulty}
- Description : ${simulation.scenario.description || ''}
- Culture : ${projectTemplate.culture || 'professionnelle'}
- Budget initial : ${projectTemplate.initialBudget || 'non défini'}
- Deadline : ${projectTemplate.deadlineDays || 'non définie'} jours

Phase actuelle "${phaseName}" — adapte le contenu des emails :
${phaseOrder === 1 ? '- Phase Initiation : emails sur la définition du projet, parties prenantes, charte projet' : ''}
${phaseOrder === 2 ? '- Phase Planification : emails sur le planning, les ressources, les risques identifiés, le budget détaillé' : ''}
${phaseOrder === 3 ? '- Phase Exécution : emails sur l\'avancement, les problèmes techniques, les livraisons, la qualité' : ''}
${phaseOrder === 4 ? '- Phase Surveillance : emails sur les écarts, les alertes KPI, les demandes de changement, les audits' : ''}
${phaseOrder === 5 ? '- Phase Clôture : emails sur la recette, le bilan, les leçons apprises, la transition' : ''}

Chaque email doit venir d'un expéditeur différent. Assure-toi que chaque email demande une action spécifique.

Retourne un tableau JSON avec cette structure exacte :
[
  {
    "senderName": "Prénom Nom",
    "senderRole": "Client|Fournisseur|Membre équipe|Sponsor|DG|DRH",
    "senderEmail": "prenom.nom@domaine.com",
    "subject": "Objet de l'email",
    "body": "Contenu complet de l'email",
    "priority": "URGENT|HIGH|NORMAL|LOW"
  }
]`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 3000,
      temperature: 0.8,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_generate_phase',
        metadata: { phaseOrder },
      },
    });

    return this.parseGeneratedEmails(result.content);
  }

  /**
   * Generate an email triggered by a random event.
   */
  async generateEventEmail(
    simulation: SimulationWithScenario,
    event: RandomEvent,
    tenantId: string,
    userId: string,
  ): Promise<GeneratedEmail> {
    const projectTemplate = simulation.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    const systemPrompt = `Tu es un générateur d'emails professionnels réalistes pour une simulation de gestion de projet.
Tu génères un email en français qui informe le chef de projet d'un événement imprévu.
L'email doit être réaliste et créer un sentiment d'urgence adapté à la gravité de l'événement.
Tu dois retourner un JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const prompt = `Génère un email professionnel qui informe le chef de projet d'un événement imprévu.

Contexte du projet :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}

Événement :
- Titre : ${event.title}
- Description : ${event.description || ''}
- Sévérité : ${event.severity}
- Type : ${event.type}

L'email doit :
1. Informer clairement de la situation
2. Décrire l'impact potentiel
3. Demander une décision ou action rapide
4. Adapter le ton a la gravité (urgent si critique, informatif si mineur)

Choisis un expéditeur logique par rapport au type d'événement (ex: technique -> développeur, budget -> DAF, équipe -> RH).

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prénom Nom",
  "senderRole": "Rôle adapté",
  "senderEmail": "prenom.nom@domaine.com",
  "subject": "Objet de l'email",
  "body": "Contenu complet de l'email",
  "priority": "URGENT|HIGH|NORMAL|LOW"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 1500,
      temperature: 0.7,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_generate_event',
        metadata: { eventId: event.id },
      },
    });

    return this.parseGeneratedEmail(result.content);
  }

  /**
   * US-5.6: Generate 2-3 simultaneous emails with different priorities.
   * Tests the learner's ability to prioritize communications.
   */
  async generateSimultaneousEmails(
    simulation: SimulationWithScenario,
    phaseOrder: number,
    tenantId: string,
    userId: string,
  ): Promise<GeneratedEmail[]> {
    const projectTemplate = simulation.scenario.projectTemplate as Record<
      string,
      unknown
    >;
    const phaseName = PHASE_NAMES[phaseOrder] || `Phase ${phaseOrder}`;

    const systemPrompt = `Tu es un générateur d'emails professionnels réalistes pour une simulation de gestion de projet.
Tu génères exactement 3 emails qui arrivent SIMULTANÉMENT au chef de projet.
Ces emails DOIVENT avoir des priorités différentes : un URGENT, un HIGH, un NORMAL.
Ils DOIVENT venir de types d'expéditeurs différents (client, membre d'équipe, direction).
L'objectif pédagogique est de tester la capacité de l'apprenant à prioriser ses réponses.
L'ordre dans lequel il répond impactera les KPIs de la simulation.
Tu dois retourner un tableau JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const prompt = `Génère exactement 3 emails professionnels qui arrivent en même temps au chef de projet durant la phase "${phaseName}".

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Difficulté : ${simulation.scenario.difficulty}
- Description : ${simulation.scenario.description || ''}
- Budget initial : ${projectTemplate.initialBudget || 'non défini'}

Règles strictes :
1. Email 1 (URGENT) : Du client ou du sponsor. Nécessite une réponse immédiate. Conséquence grave si ignore.
2. Email 2 (HIGH) : D'un membre de l'équipe ou d'un fournisseur. Problème technique ou humain important.
3. Email 3 (NORMAL) : De la DRH ou d'un collègue. Demande administrative ou informationnelle.

Chaque email doit clairement nécessiter une action de la part du chef de projet.
Le contenu doit être cohérent avec la phase "${phaseName}" du projet.

Retourne un tableau JSON avec cette structure exacte :
[
  {
    "senderName": "Prénom Nom",
    "senderRole": "Client|Sponsor|Membre équipe|Fournisseur|DRH|Collègue",
    "senderEmail": "prenom.nom@domaine.com",
    "subject": "Objet de l'email",
    "body": "Contenu complet de l'email",
    "priority": "URGENT|HIGH|NORMAL"
  }
]`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 3000,
      temperature: 0.8,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_generate_simultaneous',
        metadata: { phaseOrder },
      },
    });

    const emails = this.parseGeneratedEmails(result.content);

    // Ensure we have exactly the right priority distribution
    const priorities: Array<'URGENT' | 'HIGH' | 'NORMAL'> = [
      'URGENT',
      'HIGH',
      'NORMAL',
    ];
    return emails.slice(0, 3).map((email, index) => ({
      ...email,
      priority: priorities[index] ?? email.priority,
    }));
  }

  /**
   * Generate a change request email from the client (US-5.8).
   */
  async generateChangeRequestEmail(
    simulation: SimulationWithScenario,
    tenantId: string,
    userId: string,
  ): Promise<GeneratedEmail> {
    const projectTemplate = simulation.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    const systemPrompt = `Tu es un générateur d'emails professionnels réalistes pour une simulation de gestion de projet.
Tu génères un email de demande de changement de la part du client.
L'email doit être réaliste et représenter un vrai défi pour un chef de projet.
Tu dois retourner un JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const prompt = `Génère un email de demande de changement envoyé par le client au chef de projet.

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Phase actuelle : ${PHASE_NAMES[simulation.currentPhaseOrder] || `Phase ${simulation.currentPhaseOrder}`}
- Budget initial : ${projectTemplate.initialBudget || 'non défini'}

La demande de changement doit :
1. Être réaliste pour le secteur et le type de projet
2. Avoir un impact sur au moins 2 dimensions (scope, budget, délai, qualité)
3. Être formulée comme une demande ferme mais polie du client
4. Nécessiter une analyse d'impact de la part du chef de projet
5. Mentionner une justification business

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prénom Nom",
  "senderRole": "Client",
  "senderEmail": "prenom.nom@client.com",
  "subject": "Demande de modification - [sujet précis]",
  "body": "Contenu complet de l'email",
  "priority": "HIGH"
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 1500,
      temperature: 0.7,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_generate_change_request',
      },
    });

    return this.parseGeneratedEmail(result.content);
  }

  /**
   * AI evaluates the user's response to an email.
   */
  async evaluateResponse(
    email: SimulatedEmail,
    userResponse: string,
    simulation: SimulationWithScenario,
    tenantId: string,
    userId: string,
  ): Promise<ResponseEvaluation> {
    const systemPrompt = `Tu es un évaluateur pédagogique pour une simulation de gestion de projet.
Tu évalues la réponse d'un apprenant à un email professionnel simulé.
Tu dois retourner un JSON valide et rien d'autre.
Réponds en français correct, avec les accents.`;

    const prompt = `Évalue la réponse de l'apprenant à l'email suivant.

Email original :
- De : ${email.senderName} (${email.senderRole})
- Objet : ${email.subject}
- Contenu : ${email.body}
- Priorité : ${email.priority}

Réponse de l'apprenant :
${userResponse}

Contexte du projet :
- Projet : ${simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Phase : ${PHASE_NAMES[email.phaseOrder] || `Phase ${email.phaseOrder}`}

Évalue selon ces critères :
1. Pertinence (30%) : La réponse repond-elle aux questions/demandes de l'email ?
2. Ton professionnel (20%) : Le ton est-il adapté au destinataire et au contexte ?
3. Complétude (30%) : Tous les points sont-ils traités ? Des actions concrètes sont-elles proposées ?
4. Qualité rédactionnelle (20%) : Clarté, structure, absence de fautes majeures

Retourne un JSON avec cette structure exacte :
{
  "score": 75,
  "feedback": "Feedback détaillé en français avec points forts et axes d'amélioration. Structurer avec des paragraphes."
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 1000,
      temperature: 0.3,
      trackingContext: {
        tenantId,
        userId,
        simulationId: simulation.id,
        operation: 'email_evaluate_response',
        metadata: { emailId: email.id },
      },
    });

    return this.parseEvaluation(result.content);
  }

  // ─── Private helpers ──────────────────────────────────────

  private parseGeneratedEmail(content: string): GeneratedEmail {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in AI response');
      }
      const parsed = JSON.parse(jsonMatch[0]) as GeneratedEmail;
      this.validateEmail(parsed);
      return parsed;
    } catch (error) {
      this.logger.error(
        `Failed to parse generated email: ${(error as Error).message}`,
      );
      return this.fallbackEmail();
    }
  }

  private parseGeneratedEmails(content: string): GeneratedEmail[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }
      const parsed = JSON.parse(jsonMatch[0]) as GeneratedEmail[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Empty or invalid email array');
      }
      return parsed.map((email) => {
        this.validateEmail(email);
        return email;
      });
    } catch (error) {
      this.logger.error(
        `Failed to parse generated emails: ${(error as Error).message}`,
      );
      return [this.fallbackEmail()];
    }
  }

  private parseEvaluation(content: string): ResponseEvaluation {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in AI response');
      }
      const parsed = JSON.parse(jsonMatch[0]) as ResponseEvaluation;
      return {
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        feedback: parsed.feedback || 'Évaluation non disponible.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse evaluation: ${(error as Error).message}`,
      );
      return {
        score: 50,
        feedback:
          'L\'évaluation automatique n\'a pas pu être complétée. Votre réponse a été enregistrée.',
      };
    }
  }

  private validateEmail(email: GeneratedEmail): void {
    if (!email.senderName) email.senderName = 'Inconnu';
    if (!email.senderRole) email.senderRole = 'Collaborateur';
    if (!email.senderEmail)
      email.senderEmail = 'contact@entreprise-simulation.com';
    if (!email.subject) email.subject = 'Communication projet';
    if (!email.body)
      email.body = 'Contenu de l\'email non disponible.';
    if (!['URGENT', 'HIGH', 'NORMAL', 'LOW'].includes(email.priority)) {
      email.priority = 'NORMAL';
    }
  }

  private fallbackEmail(): GeneratedEmail {
    return {
      senderName: 'Marie Laurent',
      senderRole: 'DRH',
      senderEmail: 'marie.laurent@entreprise.com',
      subject: 'Bienvenue — Votre guide de démarrage projet',
      body: `## Bienvenue dans l'équipe !\n\nNous sommes ravis de vous accueillir en tant que Chef de Projet.\n\n## Méthodologie\n\nNous suivons le référentiel **PMBOK (PMI)** avec 5 phases :\n1. **Initiation** — Cadrage et charte\n2. **Planification** — Plan de management\n3. **Exécution** — Réalisation des livrables\n4. **Suivi & Contrôle** — Indicateurs et ajustements\n5. **Clôture** — Bilan et retour d'expérience\n\n## Outils à disposition\n\n- **Agent PMO** pour les conseils méthodologiques\n- **Éditeur de livrables** avec évaluation IA\n- **Réunions virtuelles** avec les parties prenantes\n- **Tableaux de bord** KPIs en temps réel\n\n## Prochaines étapes\n\n1. Complétez votre passation (RH + PMO)\n2. Consultez vos livrables à produire\n3. Participez à votre première réunion\n\nBonne simulation !`,
      priority: 'HIGH',
    };
  }
}
