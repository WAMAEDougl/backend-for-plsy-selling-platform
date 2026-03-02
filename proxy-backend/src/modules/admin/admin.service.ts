import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          balance: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              proxies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        proxies: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });
  }

  async updateUserBalance(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
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
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user and cascade delete related records
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  // Transaction Management
  async getAllTransactions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count(),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            balance: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // Proxy Management
  async getAllProxies(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [proxies, total] = await Promise.all([
      this.prisma.proxy.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.proxy.count(),
    ]);

    return {
      data: proxies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProxyById(proxyId: string) {
    const proxy = await this.prisma.proxy.findUnique({
      where: { id: proxyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!proxy) {
      throw new NotFoundException('Proxy not found');
    }

    return proxy;
  }

  async deleteProxy(proxyId: string) {
    const proxy = await this.prisma.proxy.findUnique({
      where: { id: proxyId },
    });

    if (!proxy) {
      throw new NotFoundException('Proxy not found');
    }

    await this.prisma.proxy.delete({
      where: { id: proxyId },
    });

    return { message: 'Proxy deleted successfully' };
  }

  // Statistics
  async getStatistics() {
    const [
      totalUsers,
      totalTransactions,
      totalProxies,
      activeProxies,
      pendingTransactions,
      completedTransactions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transaction.count(),
      this.prisma.proxy.count(),
      this.prisma.proxy.count({
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
      this.prisma.transaction.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.transaction.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        completed: completedTransactions,
      },
      proxies: {
        total: totalProxies,
        active: activeProxies,
        expired: totalProxies - activeProxies,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
    };
  }
}
