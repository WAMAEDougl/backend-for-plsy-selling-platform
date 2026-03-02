import { IsNumber, IsPositive, IsString, IsNotEmpty, Matches } from 'class-validator';

export class MpesaPaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?254|0)[17]\d{8}$/, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  accountReference?: string;

  @IsString()
  @IsOptional()
  transactionDesc?: string = 'Payment for proxy services';
}
