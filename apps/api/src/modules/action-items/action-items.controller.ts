import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auditable, CurrentTenant, CurrentUser, JwtAuthGuard } from '@sim360/core';
import { ActionItemsService } from './action-items.service';
import { CreateActionItemDto, UpdateActionItemDto } from './dto';

@ApiTags('Action items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ActionItemsController {
  constructor(private readonly actionItemsService: ActionItemsService) {}

  @Get('simulations/:simId/action-items')
  @ApiOperation({ summary: 'List follow-up actions of a simulation (optionally for one meeting)' })
  @ApiQuery({ name: 'meetingId', required: false })
  list(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('meetingId') meetingId?: string,
  ) {
    return this.actionItemsService.list(simId, user.id, tenantId, meetingId);
  }

  @Post('simulations/:simId/action-items')
  @Auditable('ACTION_ITEM_CREATED', 'ActionItem')
  @ApiOperation({ summary: 'Create a follow-up action' })
  create(
    @Param('simId') simId: string,
    @Body() dto: CreateActionItemDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.actionItemsService.create(simId, user.id, tenantId, dto);
  }

  @Patch('action-items/:id')
  @Auditable('ACTION_ITEM_UPDATED', 'ActionItem')
  @ApiOperation({ summary: 'Update a follow-up action (title, owner, due date, status)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActionItemDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.actionItemsService.update(id, user.id, tenantId, dto);
  }

  @Delete('action-items/:id')
  @Auditable('ACTION_ITEM_DELETED', 'ActionItem')
  @ApiOperation({ summary: 'Delete a follow-up action' })
  remove(@Param('id') id: string, @CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.actionItemsService.remove(id, user.id, tenantId);
  }
}
