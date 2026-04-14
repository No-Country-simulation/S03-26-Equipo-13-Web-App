import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto, FlowTrigger } from './flows.dto';
import { FLOWS_QUEUE } from './flows.processor';
import { FlowExecutionStatus } from '@prisma/client';

@Injectable()
export class FlowsService {
  private readonly logger = new Logger(FlowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FLOWS_QUEUE) private readonly flowsQueue: Queue,
  ) {}

  async findAll() {
    return this.prisma.flow.findMany({
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: { id: true, status: true, startedAt: true, finishedAt: true, contactId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateFlowDto) {
    return this.prisma.flow.create({
      data: {
        name: dto.name,
        trigger: dto.trigger,
        steps: dto.steps as any,
        active: true,
      },
    });
  }

  async update(id: string, dto: UpdateFlowDto) {
    const flow = await this.prisma.flow.findUnique({ where: { id } });
    if (!flow) throw new NotFoundException(`Flujo ${id} no encontrado`);

    return this.prisma.flow.update({
      where: { id },
      data: {
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.name && { name: dto.name }),
        ...(dto.steps && { steps: dto.steps as any }),
      },
    });
  }

  async remove(id: string) {
    const flow = await this.prisma.flow.findUnique({ where: { id } });
    if (!flow) throw new NotFoundException(`Flujo ${id} no encontrado`);

    // Borrar executions primero para evitar FK constraint
    await this.prisma.flowExecution.deleteMany({ where: { flowId: id } });
    return this.prisma.flow.delete({ where: { id } });
  }

  /** Disparar un flujo específico para un contacto dado */
  async triggerFlow(flowId: string, contactId: string) {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow || !flow.active) return null;

    const execution = await this.prisma.flowExecution.create({
      data: { flowId, contactId, status: FlowExecutionStatus.running },
    });

    const steps = flow.steps as any[];
    await this.flowsQueue.add(
      'execute_step',
      { executionId: execution.id, flowId, contactId, stepIndex: 0, steps },
      { jobId: `${execution.id}:step:0` },
    );

    return execution;
  }

  /**
   * Disparar todos los flujos activos que tengan el trigger dado.
   * Llamado desde ContactsService cuando ocurre un evento.
   */
  async triggerByEvent(trigger: FlowTrigger, contactId: string) {
    const flows = await this.prisma.flow.findMany({
      where: { trigger, active: true },
    });

    if (flows.length === 0) return;

    this.logger.log(`Triggering ${flows.length} flow(s) for event "${trigger}" on contact ${contactId}`);

    await Promise.all(flows.map((f) => this.triggerFlow(f.id, contactId)));
  }
}
