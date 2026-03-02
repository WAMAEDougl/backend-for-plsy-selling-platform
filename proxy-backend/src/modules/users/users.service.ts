import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserProfile(userId: string) {
    return this.getUserById(userId);
  }

  async updateBalance(userId: string, amount: number) {
    // Validate that the new balance won't be negative
    const user = await this.getUserById(userId);
    const newBalance = user.balance + amount;

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient balance');
    }

    // Update balance with transaction safety
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async addBalance(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.updateBalance(userId, amount);
  }

  async deductBalance(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.updateBalance(userId, -amount);
  }
}
