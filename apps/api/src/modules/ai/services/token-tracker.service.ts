import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

export interface TrackingContext {
  tenantId: string;
  userId: string;
  simulationId?: string;
  operation: string;
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
            metadata: metadata as any ?? undefined,
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
