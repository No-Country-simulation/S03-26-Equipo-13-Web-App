import { CreateContactDto } from './create-contact.dto';
export declare class ContactsService {
    findAll(status?: string, busqueda?: string, page?: number): Promise<({
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
        tasks: {
            id: string;
            status: string;
            assignedToId: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            dueDate: Date | null;
            contactId: string;
        }[];
        messages: {
            id: string;
            status: string;
            createdAt: Date;
            contactId: string;
            content: string;
            direction: string;
            channel: string;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: CreateContactDto): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: Partial<CreateContactDto>): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTags(id: string, tagNames: string[]): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        status: string;
        assignedToId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
