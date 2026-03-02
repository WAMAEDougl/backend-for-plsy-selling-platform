import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './providers/stripe/stripe.service';
import { MpesaService } from './providers/mpesa/mpesa.service';
import { UsersModule } from '../users/users.module';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [UsersModule, TaxModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, MpesaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
