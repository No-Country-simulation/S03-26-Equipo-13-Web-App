import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';
import { FLOWS_QUEUE } from './flows.processor';
import { FlowExecutionStatus } from '@prisma/client';

@Injectable()
export class FlowsService {
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

  // Called internally (e.g. from a contact event) to kick off a flow execution
  async triggerFlow(flowId: string, contactId: string) {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow || !flow.active) return null;

    const execution = await this.prisma.flowExecution.create({
      data: {
        flowId,
        contactId,
        status: FlowExecutionStatus.running,
      },
    });

    await this.flowsQueue.add(
      'execute_step',
      {
        executionId: execution.id,
        flowId,
        contactId,
        stepIndex: 0,
        steps: flow.steps as any[],
      },
      { jobId: `${execution.id}:step:0` },
    );

    return execution;
  }
}
