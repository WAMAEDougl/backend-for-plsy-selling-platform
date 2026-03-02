import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserBalanceDto } from './dto/update-user-balance.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Statistics
  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  // User Management
  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Put('users/:id/balance')
  async updateUserBalance(
    @Param('id') id: string,
    @Body() updateUserBalanceDto: UpdateUserBalanceDto,
  ) {
    return this.adminService.updateUserBalance(id, updateUserBalanceDto.amount);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Transaction Management
  @Get('transactions')
  async getAllTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllTransactions(page, limit);
  }

  @Get('transactions/:id')
  async getTransactionById(@Param('id') id: string) {
    return this.adminService.getTransactionById(id);
  }

  // Proxy Management
  @Get('proxies')
  async getAllProxies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllProxies(page, limit);
  }

  @Get('proxies/:id')
  async getProxyById(@Param('id') id: string) {
    return this.adminService.getProxyById(id);
  }

  @Delete('proxies/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProxy(@Param('id') id: string) {
    return this.adminService.deleteProxy(id);
  }
}
