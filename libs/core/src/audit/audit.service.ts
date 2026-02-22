import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../prisma/prisma.service';

interface AuditQueryFilters {
  userId?: string;
  action?: string;
  entity?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async query(filters: AuditQueryFilters) {
    const { userId, action, entity, tenantId, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (tenantId) where.tenantId = tenantId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEntityHistory(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async getUserActivity(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getStats(tenantId: string) {
    const [total, last24h, topActions] = await Promise.all([
      this.prisma.auditLog.count({ where: { tenantId } }),
      this.prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      last24h,
      topActions: topActions.map((a) => ({ action: a.action, count: a._count.action })),
    };
  }

  async cleanup(retentionDays: number) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return { deleted: result.count };
  }

  async exportPdf(filters: Omit<AuditQueryFilters, 'page' | 'limit'>): Promise<Buffer> {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('Journal d\'activite - Sim360', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#666')
        .text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

      if (filters.startDate || filters.endDate) {
        const range = [
          filters.startDate ? `Du ${new Date(filters.startDate).toLocaleDateString('fr-FR')}` : '',
          filters.endDate ? `Au ${new Date(filters.endDate).toLocaleDateString('fr-FR')}` : '',
        ].filter(Boolean).join(' ');
        doc.text(`Periode : ${range}`, { align: 'center' });
      }

      doc.text(`${logs.length} entree(s)`, { align: 'center' });
      doc.moveDown(1);

      // Table header
      const tableTop = doc.y;
      const colX = { date: 40, user: 140, action: 280, entity: 380, status: 480 };

      doc.fillColor('#f3f4f6').rect(35, tableTop - 4, 525, 18).fill();
      doc.fillColor('#333').fontSize(8).font('Helvetica-Bold');
      doc.text('Date', colX.date, tableTop, { width: 95 });
      doc.text('Utilisateur', colX.user, tableTop, { width: 135 });
      doc.text('Action', colX.action, tableTop, { width: 95 });
      doc.text('Entite', colX.entity, tableTop, { width: 95 });
      doc.text('Statut', colX.status, tableTop, { width: 60 });

      doc.moveDown(0.8);

      // Table rows
      doc.font('Helvetica').fontSize(7.5).fillColor('#444');

      for (const log of logs) {
        if (doc.y > 760) {
          doc.addPage();
        }

        const y = doc.y;
        const date = new Date(log.createdAt);
        const dateStr = `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Systeme';
        const action = log.action.replace(/_/g, ' ').toLowerCase();
        const entity = `${log.entity}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}`;
        const status = log.success ? 'OK' : 'Erreur';

        // Alternate row background
        if (logs.indexOf(log) % 2 === 0) {
          doc.fillColor('#fafafa').rect(35, y - 2, 525, 14).fill();
          doc.fillColor('#444');
        }

        doc.text(dateStr, colX.date, y, { width: 95 });
        doc.text(userName, colX.user, y, { width: 135 });
        doc.text(action, colX.action, y, { width: 95 });
        doc.text(entity, colX.entity, y, { width: 95 });

        doc.fillColor(log.success ? '#16a34a' : '#dc2626');
        doc.text(status, colX.status, y, { width: 60 });
        doc.fillColor('#444');

        doc.moveDown(0.6);
      }

      // Footer on each page
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).fillColor('#999')
          .text(`Sim360 - Page ${i + 1}/${pages.count}`, 40, 810, { align: 'center', width: 515 });
      }

      doc.end();
    });
  }
}
