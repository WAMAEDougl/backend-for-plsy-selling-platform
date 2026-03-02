import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProxiesService } from './proxies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { ProxyResponseDto } from './dto/proxy-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('proxies')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProxiesController {
  constructor(private readonly proxiesService: ProxiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProxy(
    @Request() req,
    @Body() createProxyDto: CreateProxyDto,
  ): Promise<ProxyResponseDto> {
    const proxy = await this.proxiesService.createProxy(
      req.user.userId,
      createProxyDto,
    );
    return plainToInstance(ProxyResponseDto, proxy);
  }

  @Get()
  async getUserProxies(@Request() req): Promise<ProxyResponseDto[]> {
    const proxies = await this.proxiesService.getActiveProxies(req.user.userId);
    return plainToInstance(ProxyResponseDto, proxies);
  }

  @Get(':id')
  async getProxyById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ProxyResponseDto> {
    const proxy = await this.proxiesService.getProxyById(id, req.user.userId);
    return plainToInstance(ProxyResponseDto, proxy);
  }
}
