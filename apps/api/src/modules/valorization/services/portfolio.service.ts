import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async getPortfolio(simulationId: string, userId: string, tenantId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        project: { select: { id: true, name: true, client: true, sector: true, description: true } },
        scenario: { select: { id: true, title: true, sector: true, difficulty: true, description: true } },
        kpis: true,
        phases: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, status: true } },
        userDeliverables: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                revisionNumber: true,
                score: true,
                grade: true,
                positives: true,
                improvements: true,
                missingElements: true,
                recommendations: true,
                createdAt: true,
              },
            },
          },
          orderBy: { phaseOrder: 'asc' },
        },
        competencyBadges: {
          where: { userId },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        meetings: {
          select: { id: true, title: true, status: true, phaseOrder: true },
          orderBy: { createdAt: 'asc' },
        },
        decisions: {
          select: { id: true, title: true, selectedOption: true, phaseOrder: true },
          orderBy: { phaseOrder: 'asc' },
        },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');
    if (simulation.tenantId !== tenantId) throw new ForbiddenException('Acces refuse');

    // Compute deliverable stats
    const deliverables = simulation.userDeliverables;
    const evaluatedDeliverables = deliverables.filter((d) => d.evaluations.length > 0);
    const validatedDeliverables = deliverables.filter((d) => d.status === 'VALIDATED');
    const avgScore = evaluatedDeliverables.length > 0
      ? evaluatedDeliverables.reduce((sum, d) => sum + (d.evaluations[0]?.score ?? 0), 0) / evaluatedDeliverables.length
      : null;

    // Publish export event
    await this.eventPublisher.publish(
      EventType.PORTFOLIO_EXPORTED,
      AggregateType.COMPETENCY_BADGE,
      simulationId,
      { simulationId, scenarioTitle: simulation.scenario.title, format: 'json' },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 1,
      },
    );

    return {
      simulation: {
        id: simulation.id,
        status: simulation.status,
        startedAt: simulation.startedAt,
        completedAt: simulation.completedAt,
        totalDurationMinutes: simulation.totalDurationMinutes,
        scenario: simulation.scenario,
        project: simulation.project,
      },
      scenario: simulation.scenario,
      kpis: simulation.kpis
        ? {
            budget: simulation.kpis.budget,
            schedule: simulation.kpis.schedule,
            quality: simulation.kpis.quality,
            teamMorale: simulation.kpis.teamMorale,
            riskLevel: simulation.kpis.riskLevel,
          }
        : null,
      phases: simulation.phases,
      badge: simulation.competencyBadges[0] ?? null,
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        phaseOrder: d.phaseOrder,
        status: d.status,
        revisionNumber: d.revisionNumber,
        content: d.content,
        evaluation: d.evaluations[0] ?? null,
      })),
      meetings: simulation.meetings,
      decisions: simulation.decisions,
      stats: {
        totalDeliverables: deliverables.length,
        evaluatedDeliverables: evaluatedDeliverables.length,
        validatedDeliverables: validatedDeliverables.length,
        averageDeliverableScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
        totalMeetings: simulation.meetings.length,
        completedMeetings: simulation.meetings.filter((m) => m.status === 'COMPLETED').length,
        totalDecisions: simulation.decisions.length,
        phasesCompleted: simulation.phases.filter((p) => p.status === 'COMPLETED').length,
        totalPhases: simulation.phases.length,
      },
    };
  }

  /**
   * Export portfolio as HTML (PDF-ready) document.
   * Returns a Buffer with the HTML content.
   */
  async exportPdf(
    simulationId: string,
    userId: string,
    tenantId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const portfolio = await this.getPortfolio(simulationId, userId, tenantId);

    const html = this.generatePortfolioHtml(portfolio);
    const buffer = Buffer.from(html, 'utf-8');

    return {
      buffer,
      filename: `portfolio-${simulationId.slice(0, 8)}.html`,
    };
  }

  /**
   * Export portfolio as ZIP with all deliverables.
   */
  async exportZip(
    simulationId: string,
    userId: string,
    tenantId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const portfolio = await this.getPortfolio(simulationId, userId, tenantId);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const passthrough = new PassThrough();
      passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
      passthrough.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `portfolio-${simulationId.slice(0, 8)}.zip`,
        });
      });
      passthrough.on('error', reject);

      const archive = archiver.default
        ? archiver.default('zip', { zlib: { level: 9 } })
        : (archiver as any)('zip', { zlib: { level: 9 } });
      archive.pipe(passthrough);

      // Add portfolio summary
      archive.append(this.generatePortfolioHtml(portfolio), {
        name: 'portfolio-summary.html',
      });

      // Add each deliverable as markdown
      if (portfolio.deliverables) {
        for (const del of portfolio.deliverables) {
          const content = [
            `# ${del.title}`,
            ``,
            `**Type:** ${del.type}`,
            `**Statut:** ${del.status}`,
            del.evaluation
              ? `**Score:** ${del.evaluation.score}/100 (${del.evaluation.grade})`
              : '',
            ``,
            `---`,
            ``,
            del.content ?? '*(Pas de contenu)*',
          ]
            .filter(Boolean)
            .join('\n');

          archive.append(content, {
            name: `livrables/${del.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
          });
        }
      }

      archive.finalize();
    });
  }

  /**
   * Get best deliverables filtered by minimum score.
   */
  async getBestDeliverables(
    simulationId: string,
    userId: string,
    tenantId: string,
    minScore = 70,
  ) {
    const portfolio = await this.getPortfolio(simulationId, userId, tenantId);

    const best = (portfolio.deliverables ?? [])
      .filter(
        (d: any) => d.evaluation && d.evaluation.score >= minScore,
      )
      .sort(
        (a: any, b: any) =>
          (b.evaluation?.score ?? 0) - (a.evaluation?.score ?? 0),
      );

    return { deliverables: best, totalFiltered: best.length, minScore };
  }

  private generatePortfolioHtml(portfolio: any): string {
    const deliverables = portfolio.deliverables ?? [];
    const stats = portfolio.stats ?? {};

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Portfolio — ${portfolio.simulation?.scenario?.title ?? 'Simulation'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h2 { color: #374151; margin-top: 30px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-label { font-size: 12px; color: #6b7280; }
    .deliverable { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .deliverable-header { display: flex; justify-content: space-between; align-items: center; }
    .score { font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .score-high { background: #dcfce7; color: #166534; }
    .score-mid { background: #fef9c3; color: #854d0e; }
    .score-low { background: #fecaca; color: #991b1b; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: #e5e7eb; }
  </style>
</head>
<body>
  <h1>Portfolio de competences</h1>
  <p><strong>Scenario:</strong> ${portfolio.simulation?.scenario?.title ?? 'N/A'}</p>
  <p><strong>Projet:</strong> ${portfolio.simulation?.project?.name ?? 'N/A'}</p>

  <div class="stats">
    <div class="stat"><div class="stat-value">${stats.totalDeliverables ?? 0}</div><div class="stat-label">Livrables</div></div>
    <div class="stat"><div class="stat-value">${stats.evaluatedDeliverables ?? 0}</div><div class="stat-label">Evalues</div></div>
    <div class="stat"><div class="stat-value">${stats.averageDeliverableScore ? Math.round(stats.averageDeliverableScore) : 'N/A'}</div><div class="stat-label">Score moyen</div></div>
    <div class="stat"><div class="stat-value">${stats.validatedDeliverables ?? 0}</div><div class="stat-label">Valides</div></div>
  </div>

  <h2>Livrables</h2>
  ${deliverables
    .map((d: any) => {
      const score = d.evaluation?.score;
      const scoreClass =
        score >= 70 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';
      return `<div class="deliverable">
      <div class="deliverable-header">
        <div><strong>${d.title}</strong> <span class="badge">${d.type}</span></div>
        ${score != null ? `<span class="score ${scoreClass}">${score}/100</span>` : ''}
      </div>
      <p style="font-size:13px;color:#6b7280">${d.status} — Phase ${d.phaseOrder + 1}</p>
    </div>`;
    })
    .join('\n')}

  <footer style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
    Genere par ProjectSim360 — ${new Date().toLocaleDateString('fr-FR')}
  </footer>
</body>
</html>`;
  }
}
