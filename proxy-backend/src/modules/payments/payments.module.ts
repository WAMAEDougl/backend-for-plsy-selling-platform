import { Module } from '@nestjs/common';
import { StripeService } from './providers/stripe/stripe.service';
import { MpesaService } from './providers/mpesa/mpesa.service';

@Module({
  providers: [StripeService, MpesaService]
})
export class PaymentsModule {}
