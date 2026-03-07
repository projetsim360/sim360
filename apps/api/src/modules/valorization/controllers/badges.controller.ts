import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, CurrentTenant, Auditable, Public } from '@sim360/core';
import { BadgeService } from '../services/badge.service';
import { ShareBadgeDto } from '../dto';

@ApiTags('Badges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BadgesController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get('users/me/badges')
  @ApiOperation({ summary: 'Lister les badges de l\'utilisateur connecte' })
  getMyBadges(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.badgeService.findAllForUser(user.id, tenantId);
  }

  @Get('badges/:id')
  @ApiOperation({ summary: 'Obtenir le detail d\'un badge' })
  @ApiParam({ name: 'id', description: 'ID du badge' })
  getBadge(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.badgeService.findOne(id, user.id, tenantId);
  }

  @Post('badges/:id/share')
  @Auditable('BADGE_SHARE', 'CompetencyBadge')
  @ApiOperation({ summary: 'Partager un badge (generer un lien public)' })
  @ApiParam({ name: 'id', description: 'ID du badge' })
  shareBadge(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: ShareBadgeDto,
  ) {
    return this.badgeService.share(id, user.id, tenantId, dto.isPublic ?? true);
  }

  @Public()
  @Get('badges/:id/verify')
  @ApiOperation({ summary: 'Verifier un badge via son token de partage (endpoint public)' })
  @ApiParam({ name: 'id', description: 'Token de partage du badge' })
  verifyBadge(@Param('id') shareToken: string) {
    return this.badgeService.verify(shareToken);
  }
}
