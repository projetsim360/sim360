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

    const systemPrompt = `Tu es un generateur d'emails professionnels realistes pour une simulation de gestion de projet.
Tu generes des emails en francais, avec un ton professionnel adapte au role de l'expediteur.
Tu dois retourner un JSON valide et rien d'autre.`;

    const prompt = `Genere un email de bienvenue envoye par la DRH au nouveau chef de projet.

Contexte du scenario :
- Entreprise/Projet : ${projectTemplate.name || simulation.scenario.title}
- Secteur : ${simulation.scenario.sector}
- Description : ${simulation.scenario.description || 'Projet de gestion'}
- Culture d'entreprise : ${projectTemplate.culture || 'professionnelle'}
- Objectifs : ${simulation.scenario.objectives?.join(', ') || 'Gestion de projet'}

L'email doit contenir :
1. Presentation de l'entreprise et du contexte
2. Role et responsabilites du chef de projet
3. Attentes de la direction
4. Contacts cles et prochaines etapes
5. Ton adapte a la culture d'entreprise (formel si culture formelle, decontracte si agile)

Retourne un JSON avec cette structure exacte :
{
  "senderName": "Prenom Nom",
  "senderRole": "DRH",
  "senderEmail": "prenom.nom@entreprise.com",
  "subject": "Objet de l'email",
  "body": "Contenu complet de l'email en texte avec retours a la ligne",
  "priority": "NORMAL"
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
      senderName: 'Systeme',
      senderRole: 'Systeme',
      senderEmail: 'noreply@simulation.com',
      subject: 'Communication projet',
      body: 'Un email n\'a pas pu etre genere automatiquement. Veuillez continuer votre simulation.',
      priority: 'NORMAL',
    };
  }
}
