import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

interface PlaceholderContext {
  projectName: string;
  projectCode: string;
  userName: string;
  clientName: string;
  sponsorName: string;
  sector: string;
  currentDate: string;
  projectDescription: string;
  initialBudget: string;
  deadlineDays: string;
  teamMembers: string;
}

@Injectable()
export class TemplateResolverService {
  private readonly logger = new Logger(TemplateResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve a template's {{placeholders}} with simulation-specific data.
   * Returns the pre-filled Markdown content.
   */
  async resolveTemplate(
    templateContent: string,
    simulationId: string,
  ): Promise<string> {
    const context = await this.buildContext(simulationId);
    return this.replacePlaceholders(templateContent, context);
  }

  /**
   * Build the placeholder context from simulation data.
   */
  private async buildContext(
    simulationId: string,
  ): Promise<PlaceholderContext> {
    const simulation = await this.prisma.simulation.findUniqueOrThrow({
      where: { id: simulationId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        scenario: {
          select: {
            title: true,
            sector: true,
            projectTemplate: true,
          },
        },
        project: {
          include: {
            teamMembers: {
              select: { name: true, role: true, expertise: true },
            },
          },
        },
      },
    });

    const projectTemplate =
      (simulation.scenario.projectTemplate as Record<string, unknown>) ?? {};

    // Format team members as a Markdown table
    const teamRows = simulation.project?.teamMembers
      ?.map(
        (m, i) =>
          `| ${i + 3} | ${m.name} | ${m.role} | ${String(projectTemplate.client ?? 'Organisation')} | [Email] |`,
      )
      .join('\n');

    const teamMembers = teamRows || '| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |';

    // Find sponsor from team members or use default
    const sponsor = simulation.project?.teamMembers?.find((m) =>
      m.role.toLowerCase().includes('sponsor'),
    );

    return {
      projectName: String(
        projectTemplate.name ?? simulation.project?.name ?? 'Projet',
      ),
      projectCode: String(
        projectTemplate.code ??
          simulation.project?.id?.slice(0, 8)?.toUpperCase() ??
          'PRJ-001',
      ),
      userName: simulation.user
        ? `${simulation.user.firstName} ${simulation.user.lastName}`
        : 'Chef de projet',
      clientName: String(projectTemplate.client ?? 'Client'),
      sponsorName: sponsor?.name ?? String(projectTemplate.sponsor ?? 'Sponsor'),
      sector: simulation.scenario.sector ?? 'IT',
      currentDate: new Date().toLocaleDateString('fr-FR'),
      projectDescription: String(
        projectTemplate.description ??
          simulation.scenario.title ??
          '[Description du projet]',
      ),
      initialBudget: String(projectTemplate.initialBudget ?? '[Budget]'),
      deadlineDays: String(projectTemplate.deadlineDays ?? '[Delai]'),
      teamMembers,
    };
  }

  /**
   * Replace all {{placeholder}} occurrences in the template content.
   * Unknown placeholders are left as-is.
   */
  private replacePlaceholders(
    content: string,
    context: PlaceholderContext,
  ): string {
    return content.replace(
      /\{\{(\w+)\}\}/g,
      (match, key: string) =>
        (context as unknown as Record<string, string>)[key] ?? match,
    );
  }
}
