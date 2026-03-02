import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '@prisma/client';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  balance: number;

  @Expose()
  createdAt: Date;
}
