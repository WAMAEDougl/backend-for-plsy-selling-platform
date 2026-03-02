import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EtimsService } from './etims/etims.service';

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(
    private prisma: PrismaService,
    private etimsService: EtimsService,
  ) {}

  async processTransactionTax(transactionId: string): Promise<void> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      if (!transaction) {
        this.logger.error(`Transaction not found: ${transactionId}`);
        return;
      }

      if (transaction.taxInvoiceId) {
        this.logger.log(
          `Transaction ${transactionId} already has tax invoice: ${transaction.taxInvoiceId}`,
        );
        return;
      }

      // Generate tax invoice
      const invoiceId = await this.etimsService.generateInvoice({
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        items: [
          {
            description: 'Proxy Service Payment',
            quantity: 1,
            unitPrice: transaction.amount,
            taxRate: 16, // 16% VAT for Kenya
          },
        ],
      });

      // Update transaction with tax invoice ID
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          taxInvoiceId: invoiceId,
        },
      });

      this.logger.log(
        `Tax invoice ${invoiceId} generated for transaction ${transactionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process tax for transaction ${transactionId}`,
        error,
      );
      // Don't throw error - tax processing failure shouldn't block payment
      // The invoice will be queued and retried later
    }
  }

  async processQueuedInvoices(): Promise<void> {
    try {
      await this.etimsService.processQueuedInvoices();
    } catch (error) {
      this.logger.error('Failed to process queued invoices', error);
    }
  }

  async getQueuedInvoicesCount(): Promise<number> {
    return this.etimsService.getQueuedInvoicesCount();
  }
}
