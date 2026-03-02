import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ProxyType } from '@prisma/client';

export class CreateProxyDto {
  @IsEnum(ProxyType)
  type: ProxyType;

  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDateString()
  expiresAt: string;
}
