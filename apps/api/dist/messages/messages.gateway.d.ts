import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(contactId: string, client: Socket): void;
    emitNewMessage(contactId: string, message: any): void;
    emitMessageStatusUpdate(contactId: string, update: {
        id: string;
        wamid: string;
        status: string;
    }): void;
}
