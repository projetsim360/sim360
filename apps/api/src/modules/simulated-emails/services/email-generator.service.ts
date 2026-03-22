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
  3: 'Execution',
  4: 'Surveillance et Maitrise',
  5: 'Cloture',
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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes des emails en francais, avec un ton professionnel adapte au role de l'expediteur.
Le contenu du body doit etre en format Markdown structure avec des titres (##), sous-titres (###), listes a puces, et mise en gras (**texte**).
Tu dois retourner un JSON valide et rien d'autre.`;

    const brownfieldSection = brownfieldContext
      ? `

## SECTION SUPPLEMENTAIRE OBLIGATOIRE — Etat actuel du projet (BROWNFIELD)
Comme il s'agit d'un projet en reprise (brownfield), tu DOIS ajouter une section "## Etat actuel du projet" apres la section Bienvenue, incluant :
- Decisions precedentes prises : ${JSON.stringify(brownfieldContext.previousDecisions || [])}
- Livrables deja completes : ${JSON.stringify(brownfieldContext.completedDeliverables || [])}
- Retards accumules : ${brownfieldContext.accumulatedDelays || 'non communique'}
- Budget consomme : ${brownfieldContext.budgetUsed || 'non communique'}
- Risques connus : ${JSON.stringify(brownfieldContext.knownRisks || [])}
- Moral de l'equipe : ${brownfieldContext.teamMorale || 'non communique'}
- Notes du precedent chef de projet : ${brownfieldContext.previousPmNotes || 'aucune'}

Cette section doit expliquer clairement la situation heritee, les defis en cours, et les points d'attention prioritaires pour le nouveau chef de projet.`
      : '';

    const prompt = `Genere un email de bienvenue complet envoye par la DRH au nouveau chef de projet.
Cet email sert de "Guide du Projet" (Project Handbook) et doit etre un document de reference complet.

Contexte du scenario :
- Entreprise/Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Description : ${simulation.scenario.description || 'Projet de gestion'}
- Culture d'entreprise : ${projectTemplate.culture || 'professionnelle'}
- Objectifs : ${simulation.scenario.objectives?.join(', ') || 'Gestion de projet'}
- Taille de l'equipe : ${projectTemplate.teamSize || 'non definie'}
- Budget initial : ${projectTemplate.initialBudget || 'non defini'}
- Deadline : ${projectTemplate.deadlineDays || 'non definie'} jours
- Difficulte : ${simulation.scenario.difficulty}
- Type de scenario : ${simulation.scenario.scenarioType}
- Competences visees : ${simulation.scenario.competencies?.join(', ') || 'gestion de projet'}

Le body de l'email DOIT etre en Markdown et DOIT contenir les 7 sections suivantes dans cet ordre exact :

## 1. Bienvenue
- Accueil chaleureux et personnalise de la part de la DRH
- Presentation de l'entreprise, son secteur, sa culture
- Contexte du projet et pourquoi le chef de projet a ete choisi
- Ton adapte a la culture d'entreprise (formel si culture formelle, decontracte si startup/agile)
${isBrownfield ? '\n## 2. Etat actuel du projet\n- Synthese claire de la situation heritee (retards, budget, risques, moral equipe)\n- Points d\'attention prioritaires\n- Decisions precedentes a connaitre\n- Livrables deja completes et ceux en cours' : ''}

## ${isBrownfield ? '3' : '2'}. Methodologie Projet (PMBOK/PMI)
Presenter les 5 groupes de processus PMI que le chef de projet devra suivre :
- **Initiation** : Definition du projet, identification des parties prenantes, charte de projet
- **Planification** : Elaboration du plan de management (scope, echeancier, couts, qualite, ressources, communications, risques, approvisionnements)
- **Execution** : Direction et gestion du travail, management de l'equipe, communication avec les parties prenantes
- **Surveillance et Maitrise** : Suivi de l'avancement, controle des changements, gestion des ecarts (cout, delai, qualite)
- **Cloture** : Recette finale, bilan de projet, lecons apprises, archivage, liberation des ressources

## ${isBrownfield ? '4' : '3'}. Gouvernance
Decrire la structure de gouvernance du projet :
- **Sponsor** : Qui est-il, son role (validation budget, arbitrages strategiques)
- **Chef de Projet (vous)** : Vos responsabilites (planification, coordination, reporting, gestion des risques)
- **Equipe Projet** : Composition, roles attendus, regles de fonctionnement
- **PMO** : Role d'accompagnement, support methodologique, suivi des KPIs
- **Processus d'escalade** : Quand et comment escalader (niveaux de decision)
- **Niveaux d'autorite** : Ce que le chef de projet peut decider seul vs. ce qui necessite validation

## ${isBrownfield ? '5' : '4'}. Procedures Standards
Detailler les 4 procedures cles :

### Gestion des changements
- Processus de demande de changement (change request)
- Analyse d'impact obligatoire (scope, budget, delai, qualite)
- Circuit de validation selon l'ampleur du changement

### Gestion des risques
- Identification continue des risques
- Analyse qualitative et quantitative
- Plan de reponse (eviter, transferer, attenuer, accepter)
- Suivi dans le registre des risques

### Gestion de la qualite
- Criteres d'acceptation des livrables
- Processus de revue et validation
- Normes de qualite applicables au secteur

### Communication
- Frequence des reunions (comite de pilotage, stand-up, retrospective)
- Rapports d'avancement attendus
- Canaux de communication (email, reunions, messagerie)

## ${isBrownfield ? '6' : '5'}. Outils a votre disposition
Presenter les outils disponibles dans la plateforme :
- **Agent PMO IA** : Assistant intelligent pour poser des questions methodologiques, obtenir des conseils, analyser vos decisions
- **Editeur de livrables** : Outil pour rediger et soumettre vos livrables (charte projet, plan de management, rapports, etc.) avec evaluation automatique
- **Reunions virtuelles** : Systeme de reunions avec des participants IA (client, equipe, sponsor) en mode texte ou audio
- **Tableaux de bord KPIs** : Suivi en temps reel de vos indicateurs (budget, echeancier, qualite, moral equipe, niveau de risque)
- **Boite de reception** : Emails simules de parties prenantes necessitant vos reponses et decisions

## ${isBrownfield ? '7' : '6'}. Contacts cles
Generer 4-5 contacts fictifs realistes avec :
- Nom, role, email, et dans quel cas les contacter
- Au minimum : Sponsor/DG, Client, Responsable technique, DRH, PMO

## ${isBrownfield ? '8' : '7'}. Prochaines etapes
Lister 5-6 actions concretes que le chef de projet doit accomplir en premier :
- Consulter les documents du projet
- Organiser une reunion de lancement (kick-off)
- Identifier les parties prenantes
- Rediger la charte de projet
- Prendre connaissance des KPIs initiaux
- Contacter l'equipe projet
${isBrownfield ? '- Analyser la situation heritee et identifier les actions correctives prioritaires' : ''}
${brownfieldSection}

IMPORTANT : Le body doit etre long et detaille (environ 2000-3000 mots). C'est un document de reference que l'apprenant consultera tout au long de la simulation.
Adapte le vocabulaire et les exemples au secteur "${simulation.scenario.sector}" et a la difficulte "${simulation.scenario.difficulty}".

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prenom Nom",
  "senderRole": "DRH",
  "senderEmail": "prenom.nom@entreprise.com",
  "subject": "Bienvenue - Guide du Projet [nom du projet]",
  "body": "Contenu complet en Markdown avec toutes les sections demandees",
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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes des emails en francais qui simulent des communications reelles recues par un chef de projet.
Chaque email doit avoir un expediteur different avec une personnalite distincte :
- Client : exigeant, pose des questions, demande des comptes rendus
- Fournisseur : technique, informe sur les livraisons/problemes
- Membre d'equipe : collegial, remonte des problemes ou partage des avancees
- Sponsor/DG : strategique, demande des syntheses, rappelle les enjeux business
- DRH : administratif, rappelle les processus, informe sur les equipes

Les emails doivent necessiter une action ou une decision de la part de l'apprenant.
Tu dois retourner un tableau JSON valide et rien d'autre.`;

    const prompt = `Genere entre 2 et 4 emails professionnels pour la phase "${phaseName}" (phase ${phaseOrder}/5) du projet.

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Difficulte : ${simulation.scenario.difficulty}
- Description : ${simulation.scenario.description || ''}
- Culture : ${projectTemplate.culture || 'professionnelle'}
- Budget initial : ${projectTemplate.initialBudget || 'non defini'}
- Deadline : ${projectTemplate.deadlineDays || 'non definie'} jours

Phase actuelle "${phaseName}" — adapte le contenu des emails :
${phaseOrder === 1 ? '- Phase Initiation : emails sur la definition du projet, parties prenantes, charte projet' : ''}
${phaseOrder === 2 ? '- Phase Planification : emails sur le planning, les ressources, les risques identifies, le budget detaille' : ''}
${phaseOrder === 3 ? '- Phase Execution : emails sur l\'avancement, les problemes techniques, les livraisons, la qualite' : ''}
${phaseOrder === 4 ? '- Phase Surveillance : emails sur les ecarts, les alertes KPI, les demandes de changement, les audits' : ''}
${phaseOrder === 5 ? '- Phase Cloture : emails sur la recette, le bilan, les lecons apprises, la transition' : ''}

Chaque email doit venir d'un expediteur different. Assure-toi que chaque email demande une action specifique.

Retourne un tableau JSON avec cette structure exacte :
[
  {
    "senderName": "Prenom Nom",
    "senderRole": "Client|Fournisseur|Membre equipe|Sponsor|DG|DRH",
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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes un email en francais qui informe le chef de projet d'un evenement imprevu.
L'email doit etre realiste et creer un sentiment d'urgence adapte a la gravite de l'evenement.
Tu dois retourner un JSON valide et rien d'autre.`;

    const prompt = `Genere un email professionnel qui informe le chef de projet d'un evenement imprevu.

Contexte du projet :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}

Evenement :
- Titre : ${event.title}
- Description : ${event.description || ''}
- Severite : ${event.severity}
- Type : ${event.type}

L'email doit :
1. Informer clairement de la situation
2. Decrire l'impact potentiel
3. Demander une decision ou action rapide
4. Adapter le ton a la gravite (urgent si critique, informatif si mineur)

Choisis un expediteur logique par rapport au type d'evenement (ex: technique -> developpeur, budget -> DAF, equipe -> RH).

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prenom Nom",
  "senderRole": "Role adapte",
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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes exactement 3 emails qui arrivent SIMULTANEMENT au chef de projet.
Ces emails DOIVENT avoir des priorites differentes : un URGENT, un HIGH, un NORMAL.
Ils DOIVENT venir de types d'expediteurs differents (client, membre d'equipe, direction).
L'objectif pedagogique est de tester la capacite de l'apprenant a prioriser ses reponses.
L'ordre dans lequel il repond impactera les KPIs de la simulation.
Tu dois retourner un tableau JSON valide et rien d'autre.`;

    const prompt = `Genere exactement 3 emails professionnels qui arrivent en meme temps au chef de projet durant la phase "${phaseName}".

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Difficulte : ${simulation.scenario.difficulty}
- Description : ${simulation.scenario.description || ''}
- Budget initial : ${projectTemplate.initialBudget || 'non defini'}

Regles strictes :
1. Email 1 (URGENT) : Du client ou du sponsor. Necessite une reponse immediate. Consequence grave si ignore.
2. Email 2 (HIGH) : D'un membre de l'equipe ou d'un fournisseur. Probleme technique ou humain important.
3. Email 3 (NORMAL) : De la DRH ou d'un collegue. Demande administrative ou informationnelle.

Chaque email doit clairement necessiter une action de la part du chef de projet.
Le contenu doit etre coherent avec la phase "${phaseName}" du projet.

Retourne un tableau JSON avec cette structure exacte :
[
  {
    "senderName": "Prenom Nom",
    "senderRole": "Client|Sponsor|Membre equipe|Fournisseur|DRH|Collegue",
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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes un email de demande de changement de la part du client.
L'email doit etre realiste et representer un vrai defi pour un chef de projet.
Tu dois retourner un JSON valide et rien d'autre.`;

    const prompt = `Genere un email de demande de changement envoye par le client au chef de projet.

Contexte :
- Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Phase actuelle : ${PHASE_NAMES[simulation.currentPhaseOrder] || `Phase ${simulation.currentPhaseOrder}`}
- Budget initial : ${projectTemplate.initialBudget || 'non defini'}

La demande de changement doit :
1. Etre realiste pour le secteur et le type de projet
2. Avoir un impact sur au moins 2 dimensions (scope, budget, delai, qualite)
3. Etre formulee comme une demande ferme mais polie du client
4. Necessiter une analyse d'impact de la part du chef de projet
5. Mentionner une justification business

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prenom Nom",
  "senderRole": "Client",
  "senderEmail": "prenom.nom@client.com",
  "subject": "Demande de modification - [sujet precis]",
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
    const systemPrompt = `Tu es un evaluateur pedagogique pour une simulation de gestion de projet.
Tu evalues la reponse d'un apprenant a un email professionnel simule.
Tu dois retourner un JSON valide et rien d'autre.`;

    const prompt = `Evalue la reponse de l'apprenant a l'email suivant.

Email original :
- De : ${email.senderName} (${email.senderRole})
- Objet : ${email.subject}
- Contenu : ${email.body}
- Priorite : ${email.priority}

Reponse de l'apprenant :
${userResponse}

Contexte du projet :
- Projet : ${simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Phase : ${PHASE_NAMES[email.phaseOrder] || `Phase ${email.phaseOrder}`}

Evalue selon ces criteres :
1. Pertinence (30%) : La reponse repond-elle aux questions/demandes de l'email ?
2. Ton professionnel (20%) : Le ton est-il adapte au destinataire et au contexte ?
3. Completude (30%) : Tous les points sont-ils traites ? Des actions concretes sont-elles proposees ?
4. Qualite redactionnelle (20%) : Clarte, structure, absence de fautes majeures

Retourne un JSON avec cette structure exacte :
{
  "score": 75,
  "feedback": "Feedback detaille en francais avec points forts et axes d'amelioration. Structurer avec des paragraphes."
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
        feedback: parsed.feedback || 'Evaluation non disponible.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse evaluation: ${(error as Error).message}`,
      );
      return {
        score: 50,
        feedback:
          'L\'evaluation automatique n\'a pas pu etre completee. Votre reponse a ete enregistree.',
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
      subject: 'Bienvenue — Votre guide de demarrage projet',
      body: `## Bienvenue dans l'equipe !\n\nNous sommes ravis de vous accueillir en tant que Chef de Projet.\n\n## Methodologie\n\nNous suivons le referentiel **PMBOK (PMI)** avec 5 phases :\n1. **Initiation** — Cadrage et charte\n2. **Planification** — Plan de management\n3. **Execution** — Realisation des livrables\n4. **Suivi & Controle** — Indicateurs et ajustements\n5. **Cloture** — Bilan et retour d'experience\n\n## Outils a disposition\n\n- **Agent PMO** pour les conseils methodologiques\n- **Editeur de livrables** avec evaluation IA\n- **Reunions virtuelles** avec les parties prenantes\n- **Tableaux de bord** KPIs en temps reel\n\n## Prochaines etapes\n\n1. Completez votre passation (RH + PMO)\n2. Consultez vos livrables a produire\n3. Participez a votre premiere reunion\n\nBonne simulation !`,
      priority: 'HIGH',
    };
  }
}
