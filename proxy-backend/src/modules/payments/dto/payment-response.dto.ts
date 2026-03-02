import { Exclude, Expose } from 'class-transformer';
import { PaymentProvider, TransactionStatus } from '@prisma/client';

@Exclude()
export class PaymentResponseDto {
  @Expose()
  id: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  provider: PaymentProvider;

  @Expose()
  status: TransactionStatus;

  @Expose()
  externalId?: string;

  @Expose()
  createdAt: Date;
}
