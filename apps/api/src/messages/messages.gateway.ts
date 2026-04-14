import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Frontend joins a room to receive messages for a specific contact
  @SubscribeMessage('join_contact')
  handleJoin(@MessageBody() contactId: string, @ConnectedSocket() client: Socket) {
    client.join(`contact:${contactId}`);
    this.logger.log(`${client.id} joined room contact:${contactId}`);
  }

  // Emits a new inbound or outbound message to the contact's room
  emitNewMessage(contactId: string, message: any) {
    this.server.to(`contact:${contactId}`).emit('new_message', message);
  }

  // Emits a status change (sent → delivered → read → failed) for tick icons in the UI
  emitMessageStatusUpdate(contactId: string, update: { id: string; wamid: string; status: string }) {
    this.server.to(`contact:${contactId}`).emit('message_status', update);
  }

  // Emits a task reminder so the frontend can show a toast notification
  emitTaskReminder(contactId: string, reminder: { taskId: string; title: string; assignedToId?: string }) {
    this.server.to(`contact:${contactId}`).emit('task_reminder', reminder);
    // Also broadcast globally so any connected agent sees it regardless of active contact
    this.server.emit('task_reminder', reminder);
  }
}
