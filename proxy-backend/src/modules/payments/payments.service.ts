import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TaxService } from '../tax/tax.service';
import { StripeService } from './providers/stripe/stripe.service';
import { MpesaService } from './providers/mpesa/mpesa.service';
import { PaymentProvider, TransactionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private taxService: TaxService,
    private stripeService: StripeService,
    private mpesaService: MpesaService,
  ) {}

  async initiateStripePayment(userId: string, amount: number, currency: string = 'usd') {
    // Create pending transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency,
        provider: PaymentProvider.STRIPE,
        status: TransactionStatus.PENDING,
      },
    });

    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency,
        {
          transactionId: transaction.id,
          userId,
        },
      );

      // Update transaction with external ID
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalId: paymentIntent.paymentIntentId,
        },
      });

      this.logger.log(
        `Stripe payment initiated: Transaction ${transaction.id}, PaymentIntent ${paymentIntent.paymentIntentId}`,
      );

      return {
        transactionId: transaction.id,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error) {
      // Mark transaction as failed
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });

      this.logger.error('Failed to initiate Stripe payment', error);
      throw error;
    }
  }

  async initiateMpesaPayment(
    userId: string,
    amount: number,
    phoneNumber: string,
    accountReference?: string,
    transactionDesc?: string,
  ) {
    // Create pending transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        currency: 'KES',
        provider: PaymentProvider.MPESA,
        status: TransactionStatus.PENDING,
      },
    });

    try {
      // Initiate STK Push
      const stkPush = await this.mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        accountReference || transaction.id,
        transactionDesc || 'Payment for proxy services',
      );

      // Update transaction with external ID (CheckoutRequestID)
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalId: stkPush.checkoutRequestId,
        },
      });

      this.logger.log(
        `M-Pesa payment initiated: Transaction ${transaction.id}, CheckoutRequestID ${stkPush.checkoutRequestId}`,
      );

      return {
        transactionId: transaction.id,
        checkoutRequestId: stkPush.checkoutRequestId,
        merchantRequestId: stkPush.merchantRequestId,
        responseDescription: stkPush.responseDescription,
        customerMessage: stkPush.customerMessage,
      };
    } catch (error) {
      // Mark transaction as failed
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });

      this.logger.error('Failed to initiate M-Pesa payment', error);
      throw error;
    }
  }

  async completePayment(transactionId: string, externalId?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      this.logger.warn(`Transaction ${transactionId} already completed`);
      return transaction;
    }

    // Update transaction status
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        ...(externalId && { externalId }),
      },
    });

    // Update user balance
    await this.usersService.addBalance(transaction.userId, transaction.amount);

    // Generate tax invoice (non-blocking)
    this.taxService.processTransactionTax(transactionId).catch((error) => {
      this.logger.error(
        `Tax processing failed for transaction ${transactionId}`,
        error,
      );
    });

    this.logger.log(
      `Payment completed: Transaction ${transactionId}, Amount ${transaction.amount}`,
    );

    return updatedTransaction;
  }

  async failPayment(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
      },
    });

    this.logger.log(`Payment failed: Transaction ${transactionId}`);

    return updatedTransaction;
  }

  async getTransactionById(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleStripeWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'payment_intent.succeeded':
        const paymentIntent = data.object;
        const transactionId = paymentIntent.metadata?.transactionId;

        if (transactionId) {
          await this.completePayment(transactionId, paymentIntent.id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = data.object;
        const failedTransactionId = failedIntent.metadata?.transactionId;

        if (failedTransactionId) {
          await this.failPayment(failedTransactionId);
        }
        break;

      default:
        this.logger.log(`Unhandled Stripe webhook event: ${type}`);
    }
  }

  async handleMpesaCallback(callbackData: any) {
    const result = await this.mpesaService.handleCallback(callbackData);

    if (result.success) {
      // Find transaction by CheckoutRequestID
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          externalId: result.checkoutRequestId,
          provider: PaymentProvider.MPESA,
        },
      });

      if (transaction) {
        await this.completePayment(transaction.id, result.mpesaReceiptNumber);
      }
    } else {
      // Find and fail transaction
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          externalId: result.checkoutRequestId,
          provider: PaymentProvider.MPESA,
        },
      });

      if (transaction) {
        await this.failPayment(transaction.id);
      }
    }

    return result;
  }
}
