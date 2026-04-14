import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/summary')
  @ApiOperation({ summary: 'KPIs del dashboard: contactos activos, mensajes, tasa de respuesta' })
  @ApiResponse({ status: 200, description: 'Objeto con totalContacts, activeContacts, totalMessages, responseRate' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('analytics/messages')
  @ApiOperation({ summary: 'Datos para gráfica de mensajes por día' })
  @ApiQuery({ name: 'range', enum: ['7d', '30d'], required: false, description: 'Rango de tiempo (default: 7d)' })
  @ApiResponse({ status: 200, description: 'Array de { date, sent, received } por día' })
  getMessageStats(@Query('range') range?: '7d' | '30d') {
    return this.analyticsService.getMessageStats(range ?? '7d');
  }

  @Get('export/contacts')
  @ApiOperation({ summary: 'Descargar todos los contactos como CSV (síncrono)' })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'Archivo CSV con BOM UTF-8 — compatible con Excel', content: { 'text/csv': {} } })
  async downloadContactsCsv(@Res() res: Response) {
    const csv = await this.analyticsService.buildContactsCsv();
    const filename = `contactos-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // UTF-8 BOM so Excel opens it correctly
  }

  @Post('export/contacts')
  @ApiOperation({ summary: 'Encolar exportación de contactos en segundo plano (BullMQ)' })
  @ApiResponse({ status: 201, description: 'Job encolado. Retorna { ok: true, jobId }' })
  exportContacts() {
    return this.analyticsService.queueContactsExport();
  }
}
