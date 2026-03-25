import { ContactStatus } from '@prisma/client';
export declare class CreateContactDto {
    name: string;
    phone: string;
    email?: string;
    status?: ContactStatus;
    notes?: string;
    assignedToId?: string;
}
