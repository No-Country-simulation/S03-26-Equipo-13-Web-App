import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/summary')
  @ApiOperation({ summary: 'KPIs del dashboard: contactos activos, mensajes, tasa de respuesta' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('analytics/messages')
  @ApiOperation({ summary: 'Datos para gráfica de mensajes por día' })
  @ApiQuery({ name: 'range', enum: ['7d', '30d'], required: false })
  getMessageStats(@Query('range') range?: '7d' | '30d') {
    return this.analyticsService.getMessageStats(range ?? '7d');
  }

  @Post('export/contacts')
  @ApiOperation({ summary: 'Exportar contactos a CSV — corre en segundo plano con BullMQ' })
  exportContacts() {
    return this.analyticsService.queueContactsExport();
  }
}
