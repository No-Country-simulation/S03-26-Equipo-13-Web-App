import { ContactsService } from './contacts.service';
import { CreateContactDto } from './create-contact.dto';
import { Contact } from '@prisma/client';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    findAll(status?: string, busqueda?: string, page?: string): Promise<Contact[]>;
    findOne(id: string): Promise<Contact | null>;
    create(dto: CreateContactDto): Promise<Contact>;
    update(id: string, dto: Partial<CreateContactDto>): Promise<Contact>;
    updateTags(id: string, tags: string[]): Promise<Contact>;
    remove(id: string): Promise<Contact>;
}
