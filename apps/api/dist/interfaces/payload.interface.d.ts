import { UserRole } from '@prisma/client';
export interface Payload {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
