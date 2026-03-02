import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class StripePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'usd';
}
