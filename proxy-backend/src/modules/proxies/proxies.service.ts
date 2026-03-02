import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { ProxyType } from '@prisma/client';

@Injectable()
export class ProxiesService {
  constructor(private prisma: PrismaService) {}

  async createProxy(userId: string, createProxyDto: CreateProxyDto) {
    const proxy = await this.prisma.proxy.create({
      data: {
        type: createProxyDto.type,
        ipAddress: createProxyDto.ipAddress,
        port: createProxyDto.port,
        username: createProxyDto.username,
        password: createProxyDto.password,
        expiresAt: new Date(createProxyDto.expiresAt),
        isActive: true,
        userId,
      },
    });

    return proxy;
  }

  async getUserProxies(userId: string, activeOnly: boolean = true) {
    const where: any = { userId };

    if (activeOnly) {
      where.isActive = true;
      where.expiresAt = {
        gt: new Date(),
      };
    }

    const proxies = await this.prisma.proxy.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return proxies;
  }

  async getProxyById(proxyId: string, userId: string) {
    const proxy = await this.prisma.proxy.findFirst({
      where: {
        id: proxyId,
        userId,
      },
    });

    if (!proxy) {
      throw new NotFoundException('Proxy not found');
    }

    return proxy;
  }

  async getActiveProxies(userId: string) {
    return this.getUserProxies(userId, true);
  }

  async expireProxy(proxyId: string, userId: string) {
    const proxy = await this.getProxyById(proxyId, userId);

    const updatedProxy = await this.prisma.proxy.update({
      where: { id: proxy.id },
      data: {
        isActive: false,
      },
    });

    return updatedProxy;
  }

  async checkAndExpireProxies() {
    // This method can be called by a cron job to expire proxies
    const expiredProxies = await this.prisma.proxy.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return expiredProxies;
  }
}
