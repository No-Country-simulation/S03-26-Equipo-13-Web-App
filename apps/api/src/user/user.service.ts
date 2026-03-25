import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Columns safe to return — never include password
const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UserService {
  // Inject PrismaService — never instantiate PrismaClient directly in a service
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password before storing — never save plain text
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: SAFE_SELECT,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: SAFE_SELECT });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id); // throws 404 if not found

    // If password is being updated, hash it
    const safeData = data.password
      ? { ...data, password: await bcrypt.hash(data.password, 10) }
      : data;

    return this.prisma.user.update({
      where: { id },
      data: safeData,
      select: SAFE_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // throws 404 if not found
    return this.prisma.user.delete({
      where: { id },
      // select: SAFE_SELECT ensures password is not returned on delete
      select: SAFE_SELECT,
    });
  }
}
