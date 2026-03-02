import { Exclude, Expose } from 'class-transformer';
import { ProxyType } from '@prisma/client';

@Exclude()
export class ProxyResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ProxyType;

  @Expose()
  ipAddress: string;

  @Expose()
  port: number;

  @Expose()
  username: string;

  @Expose()
  password: string;

  @Expose()
  expiresAt: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
