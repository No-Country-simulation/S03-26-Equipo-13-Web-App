import { ContactsService } from './contacts.service';
import { CreateContactDto } from './create-contact.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    findAll(status?: string, busqueda?: string, page?: string): Promise<{
        data: ({
            tags: {
                id: string;
                name: string;
                createdAt: Date;
            }[];
            assignedTo: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            status: import(".prisma/client").$Enums.ContactStatus;
            notes: string | null;
            assignedToId: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            assignedToId: string | null;
            dueDate: Date | null;
            contactId: string;
        }[];
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
        assignedTo: {
            id: string;
            name: string;
        } | null;
        messages: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.MessageStatus;
            contactId: string;
            content: string;
            direction: import(".prisma/client").$Enums.MessageDirection;
            channel: import(".prisma/client").$Enums.MessageChannel;
            wamid: string | null;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        notes: string | null;
        assignedToId: string | null;
    }>;
    create(dto: CreateContactDto): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        notes: string | null;
        assignedToId: string | null;
    }>;
    update(id: string, dto: Partial<CreateContactDto>): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        notes: string | null;
        assignedToId: string | null;
    }>;
    updateTags(id: string, tags: string[]): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        notes: string | null;
        assignedToId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        status: import(".prisma/client").$Enums.ContactStatus;
        notes: string | null;
        assignedToId: string | null;
    }>;
}
