import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.configService.get<string>('mpesa.apiUrl'),
      timeout: 30000,
    });
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const consumerKey = this.configService.get<string>('mpesa.consumerKey');
      const consumerSecret = this.configService.get<string>(
        'mpesa.consumerSecret',
      );

      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
        'base64',
      );

      const response = await this.httpClient.get(
        '/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Token typically expires in 3600 seconds, cache for 55 minutes
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      this.logger.log('M-Pesa access token generated successfully');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to generate M-Pesa access token', error);
      throw error;
    }
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
  ) {
    try {
      const accessToken = await this.getAccessToken();
      const shortcode = this.configService.get<string>('mpesa.shortcode');
      const passkey = this.configService.get<string>('mpesa.passkey');
      const callbackUrl = this.configService.get<string>('mpesa.callbackUrl');

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
        'base64',
      );

      // Format phone number (remove + and ensure it starts with 254)
      const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');

      const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      const response = await this.httpClient.post(
        '/mpesa/stkpush/v1/processrequest',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `STK Push initiated for ${formattedPhone}, CheckoutRequestID: ${response.data.CheckoutRequestID}`,
      );

      return {
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage,
      };
    } catch (error) {
      this.logger.error('Failed to initiate STK Push', error);
      throw error;
    }
  }

  async handleCallback(callbackData: any) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
        const amount = callbackMetadata.find(
          (item: any) => item.Name === 'Amount',
        )?.Value;
        const mpesaReceiptNumber = callbackMetadata.find(
          (item: any) => item.Name === 'MpesaReceiptNumber',
        )?.Value;
        const transactionDate = callbackMetadata.find(
          (item: any) => item.Name === 'TransactionDate',
        )?.Value;
        const phoneNumber = callbackMetadata.find(
          (item: any) => item.Name === 'PhoneNumber',
        )?.Value;

        this.logger.log(
          `M-Pesa payment successful: ${mpesaReceiptNumber}, Amount: ${amount}`,
        );

        return {
          success: true,
          checkoutRequestId,
          mpesaReceiptNumber,
          amount,
          transactionDate,
          phoneNumber,
          resultDesc,
        };
      } else {
        // Payment failed
        this.logger.warn(
          `M-Pesa payment failed: ${checkoutRequestId}, Reason: ${resultDesc}`,
        );

        return {
          success: false,
          checkoutRequestId,
          resultCode,
          resultDesc,
        };
      }
    } catch (error) {
      this.logger.error('Failed to process M-Pesa callback', error);
      throw error;
    }
  }

  async queryTransactionStatus(checkoutRequestId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const shortcode = this.configService.get<string>('mpesa.shortcode');
      const passkey = this.configService.get<string>('mpesa.passkey');

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
        'base64',
      );

      const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await this.httpClient.post(
        '/mpesa/stkpushquery/v1/query',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        success: response.data.ResultCode === '0',
      };
    } catch (error) {
      this.logger.error(
        `Failed to query transaction status: ${checkoutRequestId}`,
        error,
      );
      throw error;
    }
  }
}
