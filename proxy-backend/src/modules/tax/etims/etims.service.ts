import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface EtimsInvoiceData {
  transactionId: string;
  amount: number;
  currency: string;
  customerTin?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}

@Injectable()
export class EtimsService {
  private readonly logger = new Logger(EtimsService.name);
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private invoiceQueue: Map<string, EtimsInvoiceData> = new Map();

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.configService.get<string>('etims.apiUrl'),
      timeout: 30000,
    });
  }

  private async authenticate(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const apiKey = this.configService.get<string>('etims.apiKey');
      const tin = this.configService.get<string>('etims.tin');

      const response = await this.httpClient.post('/auth/login', {
        tin,
        apiKey,
      });

      this.accessToken = response.data.token;
      // Cache token for 55 minutes
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      this.logger.log('ETIMS authentication successful');
      return this.accessToken;
    } catch (error) {
      this.logger.error('ETIMS authentication failed', error);
      throw error;
    }
  }

  async generateInvoice(invoiceData: EtimsInvoiceData): Promise<string> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const token = await this.authenticate();

        const payload = {
          transactionReference: invoiceData.transactionId,
          totalAmount: invoiceData.amount,
          currency: invoiceData.currency,
          customerTin: invoiceData.customerTin || 'N/A',
          items: invoiceData.items,
          invoiceDate: new Date().toISOString(),
        };

        const response = await this.httpClient.post(
          '/invoices/generate',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const invoiceId = response.data.invoiceId;
        this.logger.log(
          `ETIMS invoice generated: ${invoiceId} for transaction ${invoiceData.transactionId}`,
        );

        // Remove from queue if it was queued
        this.invoiceQueue.delete(invoiceData.transactionId);

        return invoiceId;
      } catch (error) {
        lastError = error;
        const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff

        this.logger.warn(
          `ETIMS invoice generation attempt ${attempt} failed, retrying in ${backoffTime}ms`,
        );

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    // All retries failed, queue for later processing
    this.logger.error(
      `Failed to generate ETIMS invoice after ${maxRetries} attempts, queuing for later`,
      lastError,
    );
    this.invoiceQueue.set(invoiceData.transactionId, invoiceData);

    throw lastError;
  }

  async processQueuedInvoices(): Promise<void> {
    if (this.invoiceQueue.size === 0) {
      return;
    }

    this.logger.log(
      `Processing ${this.invoiceQueue.size} queued ETIMS invoices`,
    );

    const entries = Array.from(this.invoiceQueue.entries());

    for (const [transactionId, invoiceData] of entries) {
      try {
        await this.generateInvoice(invoiceData);
      } catch (error) {
        this.logger.error(
          `Failed to process queued invoice for transaction ${transactionId}`,
          error,
        );
      }
    }
  }

  getQueuedInvoicesCount(): number {
    return this.invoiceQueue.size;
  }

  async checkInvoiceStatus(invoiceId: string): Promise<any> {
    try {
      const token = await this.authenticate();

      const response = await this.httpClient.get(`/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check invoice status: ${invoiceId}`, error);
      throw error;
    }
  }
}
