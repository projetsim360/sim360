import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

export interface TrackingContext {
  tenantId: string;
  userId: string;
  simulationId?: string;
  operation: string;
  metadata?: Record<string, unknown>;
}

// Pricing per 1M tokens (USD) — updated Feb 2026
// Includes a configurable margin for resale
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  'claude-sonnet-4-20250514':       { input: 3.00,  output: 15.00 },
  'claude-haiku-4-20250514':        { input: 0.80,  output: 4.00 },
  // OpenAI
  'gpt-4o':                         { input: 2.50,  output: 10.00 },
  'gpt-4o-mini':                    { input: 0.15,  output: 0.60 },
  'gpt-4o-realtime-preview-2025-06-03': { input: 5.00, output: 20.00 },
};

const DEFAULT_PRICING = { input: 3.00, output: 15.00 };

// Margin multiplier applied on top of provider cost (e.g. 1.3 = 30% margin)
const MARGIN_MULTIPLIER = 1.3;

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING;
  const rawCost =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output;
  return Math.round(rawCost * MARGIN_MULTIPLIER * 10000) / 10000; // 4 decimal precision
}

@Injectable()
export class TokenTrackerService {
  private readonly logger = new Logger(TokenTrackerService.name);

  constructor(private prisma: PrismaService) {}

  async track(
    context: TrackingContext,
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.aiTokenUsage.create({
          data: {
            tenantId: context.tenantId,
            userId: context.userId,
            simulationId: context.simulationId,
            operation: context.operation,
            provider,
            model,
            inputTokens,
            outputTokens,
            metadata: (context.metadata || metadata) ? { ...context.metadata, ...metadata } as any : undefined,
          },
        }),
        this.prisma.aiTokenQuota.upsert({
          where: { tenantId: context.tenantId },
          create: {
            tenantId: context.tenantId,
            currentMonthInput: inputTokens,
            currentMonthOutput: outputTokens,
            periodStart: this.getMonthStart(),
          },
          update: {
            currentMonthInput: { increment: inputTokens },
            currentMonthOutput: { increment: outputTokens },
          },
        }),
      ]);
    } catch (error: any) {
      this.logger.error(`Token tracking failed: ${error.message}`);
    }
  }

  async checkQuota(tenantId: string): Promise<void> {
    const quota = await this.prisma.aiTokenQuota.findUnique({
      where: { tenantId },
    });

    if (!quota) return; // No quota set = unlimited

    // Auto-reset monthly counters
    const monthStart = this.getMonthStart();
    if (quota.periodStart < monthStart) {
      await this.prisma.aiTokenQuota.update({
        where: { tenantId },
        data: {
          currentMonthInput: 0,
          currentMonthOutput: 0,
          periodStart: monthStart,
        },
      });
      return;
    }

    if (quota.currentMonthInput >= quota.monthlyInputLimit) {
      throw new ForbiddenException(
        `Quota de tokens d'entree mensuel atteint (${quota.monthlyInputLimit} tokens)`,
      );
    }

    if (quota.currentMonthOutput >= quota.monthlyOutputLimit) {
      throw new ForbiddenException(
        `Quota de tokens de sortie mensuel atteint (${quota.monthlyOutputLimit} tokens)`,
      );
    }
  }

  async getUsage(tenantId: string): Promise<{
    currentMonthInput: number;
    currentMonthOutput: number;
    periodStart: Date;
  }> {
    const monthStart = this.getMonthStart();

    const result = await this.prisma.aiTokenUsage.aggregate({
      where: {
        tenantId,
        createdAt: { gte: monthStart },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
      },
    });

    return {
      currentMonthInput: result._sum.inputTokens ?? 0,
      currentMonthOutput: result._sum.outputTokens ?? 0,
      periodStart: monthStart,
    };
  }

  async getQuota(tenantId: string) {
    const quota = await this.prisma.aiTokenQuota.findUnique({
      where: { tenantId },
    });

    if (!quota) {
      return {
        monthlyInputLimit: 500000,
        monthlyOutputLimit: 200000,
        currentMonthInput: 0,
        currentMonthOutput: 0,
        remainingInput: 500000,
        remainingOutput: 200000,
      };
    }

    // Auto-reset if needed
    const monthStart = this.getMonthStart();
    const currentInput = quota.periodStart < monthStart ? 0 : quota.currentMonthInput;
    const currentOutput = quota.periodStart < monthStart ? 0 : quota.currentMonthOutput;

    return {
      monthlyInputLimit: quota.monthlyInputLimit,
      monthlyOutputLimit: quota.monthlyOutputLimit,
      currentMonthInput: currentInput,
      currentMonthOutput: currentOutput,
      remainingInput: Math.max(0, quota.monthlyInputLimit - currentInput),
      remainingOutput: Math.max(0, quota.monthlyOutputLimit - currentOutput),
    };
  }

  async getUsageBySimulation(tenantId: string): Promise<
    Array<{
      simulationId: string;
      projectName: string;
      scenarioTitle: string;
      inputTokens: number;
      outputTokens: number;
      callCount: number;
    }>
  > {
    const monthStart = this.getMonthStart();

    // Group token usage by simulationId for the current month
    const grouped = await this.prisma.aiTokenUsage.groupBy({
      by: ['simulationId'],
      where: {
        tenantId,
        createdAt: { gte: monthStart },
        simulationId: { not: null },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
      },
      _count: true,
      orderBy: { _sum: { inputTokens: 'desc' } },
    });

    if (grouped.length === 0) return [];

    // Fetch simulation details (project name + scenario title)
    const simIds = grouped.map((g) => g.simulationId!);
    const simulations = await this.prisma.simulation.findMany({
      where: { id: { in: simIds } },
      select: {
        id: true,
        project: { select: { name: true } },
        scenario: { select: { title: true } },
      },
    });

    const simMap = new Map(simulations.map((s) => [s.id, s]));

    return grouped.map((g) => {
      const sim = simMap.get(g.simulationId!);
      return {
        simulationId: g.simulationId!,
        projectName: sim?.project.name ?? 'Inconnu',
        scenarioTitle: sim?.scenario.title ?? 'Inconnu',
        inputTokens: g._sum.inputTokens ?? 0,
        outputTokens: g._sum.outputTokens ?? 0,
        callCount: g._count,
      };
    });
  }

  async getBilling(tenantId: string) {
    const monthStart = this.getMonthStart();

    // Get all usage records for this tenant this month
    const records = await this.prisma.aiTokenUsage.findMany({
      where: { tenantId, createdAt: { gte: monthStart } },
      select: {
        model: true,
        provider: true,
        operation: true,
        inputTokens: true,
        outputTokens: true,
        simulationId: true,
      },
    });

    // Aggregate by model
    const byModel: Record<string, { inputTokens: number; outputTokens: number; cost: number; calls: number }> = {};
    let totalCost = 0;
    let totalInput = 0;
    let totalOutput = 0;

    for (const r of records) {
      const cost = calculateCost(r.model, r.inputTokens, r.outputTokens);
      totalCost += cost;
      totalInput += r.inputTokens;
      totalOutput += r.outputTokens;

      const key = `${r.provider}/${r.model}`;
      if (!byModel[key]) {
        byModel[key] = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };
      }
      byModel[key].inputTokens += r.inputTokens;
      byModel[key].outputTokens += r.outputTokens;
      byModel[key].cost += cost;
      byModel[key].calls += 1;
    }

    // Aggregate by operation
    const byOperation: Record<string, { inputTokens: number; outputTokens: number; cost: number; calls: number }> = {};
    for (const r of records) {
      const cost = calculateCost(r.model, r.inputTokens, r.outputTokens);
      if (!byOperation[r.operation]) {
        byOperation[r.operation] = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };
      }
      byOperation[r.operation].inputTokens += r.inputTokens;
      byOperation[r.operation].outputTokens += r.outputTokens;
      byOperation[r.operation].cost += cost;
      byOperation[r.operation].calls += 1;
    }

    // Aggregate by simulation
    const bySimulation: Record<string, { inputTokens: number; outputTokens: number; cost: number; calls: number }> = {};
    for (const r of records) {
      if (!r.simulationId) continue;
      const cost = calculateCost(r.model, r.inputTokens, r.outputTokens);
      if (!bySimulation[r.simulationId]) {
        bySimulation[r.simulationId] = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };
      }
      bySimulation[r.simulationId].inputTokens += r.inputTokens;
      bySimulation[r.simulationId].outputTokens += r.outputTokens;
      bySimulation[r.simulationId].cost += cost;
      bySimulation[r.simulationId].calls += 1;
    }

    // Enrich simulations with project names
    const simIds = Object.keys(bySimulation);
    const simulations = simIds.length > 0
      ? await this.prisma.simulation.findMany({
          where: { id: { in: simIds } },
          select: { id: true, project: { select: { name: true } }, scenario: { select: { title: true } } },
        })
      : [];
    const simMap = new Map(simulations.map((s) => [s.id, s]));

    const simulationBreakdown = simIds.map((simId) => {
      const sim = simMap.get(simId);
      const data = bySimulation[simId];
      return {
        simulationId: simId,
        projectName: sim?.project.name ?? 'Inconnu',
        scenarioTitle: sim?.scenario.title ?? 'Inconnu',
        ...data,
        cost: Math.round(data.cost * 10000) / 10000,
      };
    }).sort((a, b) => b.cost - a.cost);

    return {
      periodStart: monthStart,
      currency: 'USD',
      marginPercent: Math.round((MARGIN_MULTIPLIER - 1) * 100),
      totalCost: Math.round(totalCost * 100) / 100,
      totalInput,
      totalOutput,
      totalCalls: records.length,
      byModel: Object.entries(byModel).map(([model, data]) => ({
        model,
        ...data,
        cost: Math.round(data.cost * 10000) / 10000,
      })).sort((a, b) => b.cost - a.cost),
      byOperation: Object.entries(byOperation).map(([operation, data]) => ({
        operation,
        ...data,
        cost: Math.round(data.cost * 10000) / 10000,
      })).sort((a, b) => b.cost - a.cost),
      bySimulation: simulationBreakdown,
    };
  }

  async updateQuota(
    tenantId: string,
    monthlyInputLimit: number,
    monthlyOutputLimit: number,
  ) {
    return this.prisma.aiTokenQuota.upsert({
      where: { tenantId },
      create: {
        tenantId,
        monthlyInputLimit,
        monthlyOutputLimit,
        periodStart: this.getMonthStart(),
      },
      update: {
        monthlyInputLimit,
        monthlyOutputLimit,
      },
    });
  }

  private getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
