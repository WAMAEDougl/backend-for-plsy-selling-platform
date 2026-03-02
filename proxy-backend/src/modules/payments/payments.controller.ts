import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StripePaymentDto } from './dto/stripe-payment.dto';
import { MpesaPaymentDto } from './dto/mpesa-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('payments')
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async initiateStripePayment(
    @Request() req,
    @Body() stripePaymentDto: StripePaymentDto,
  ) {
    return this.paymentsService.initiateStripePayment(
      req.user.userId,
      stripePaymentDto.amount,
      stripePaymentDto.currency,
    );
  }

  @Post('mpesa')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async initiateMpesaPayment(
    @Request() req,
    @Body() mpesaPaymentDto: MpesaPaymentDto,
  ) {
    return this.paymentsService.initiateMpesaPayment(
      req.user.userId,
      mpesaPaymentDto.amount,
      mpesaPaymentDto.phoneNumber,
      mpesaPaymentDto.accountReference,
      mpesaPaymentDto.transactionDesc,
    );
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const event = await this.paymentsService['stripeService'].handleWebhook(
      signature,
      req.rawBody,
    );

    if (event) {
      await this.paymentsService.handleStripeWebhook(event);
    }

    return { received: true };
  }

  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  async handleMpesaCallback(@Body() callbackData: any) {
    await this.paymentsService.handleMpesaCallback(callbackData);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getUserTransactions(@Request() req): Promise<PaymentResponseDto[]> {
    const transactions = await this.paymentsService.getUserTransactions(
      req.user.userId,
    );
    return plainToInstance(PaymentResponseDto, transactions);
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  async getTransaction(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    const transaction = await this.paymentsService.getTransactionById(
      id,
      req.user.userId,
    );
    return plainToInstance(PaymentResponseDto, transaction);
  }
}
