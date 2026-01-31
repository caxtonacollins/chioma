/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AnchorTransaction,
  AnchorTransactionStatus,
  AnchorTransactionType,
  PaymentMethodType,
} from '../../transactions/entities/anchor-transaction.entity';

interface AnchorDepositRequest {
  asset_code: string;
  account: string;
  amount?: string;
  type?: string;
}

interface AnchorWithdrawRequest {
  asset_code: string;
  account: string;
  amount: string;
  dest?: string;
  type?: string;
}

interface AnchorTransactionResponse {
  id: string;
  status: string;
  status_eta?: number;
  amount_in?: string;
  amount_out?: string;
  amount_fee?: string;
  stellar_transaction_id?: string;
  external_transaction_id?: string;
  message?: string;
}

@Injectable()
export class AnchorService {
  private readonly logger = new Logger(AnchorService.name);
  private readonly httpClient: AxiosInstance;
  private readonly anchorApiUrl: string;
  private readonly anchorApiKey: string;
  private readonly usdcAsset: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AnchorTransaction)
    private readonly anchorTransactionRepository: Repository<AnchorTransaction>,
  ) {
    this.anchorApiUrl = this.configService.get<string>('ANCHOR_API_URL') || '';
    this.anchorApiKey = this.configService.get<string>('ANCHOR_API_KEY') || '';
    this.usdcAsset = this.configService.get<string>('ANCHOR_USDC_ASSET') || '';

    this.httpClient = axios.create({
      baseURL: this.anchorApiUrl,
      headers: {
        Authorization: `Bearer ${this.anchorApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async initiateDeposit(
    amount: number,
    currency: string,
    walletAddress: string,
    paymentMethod: PaymentMethodType,
  ): Promise<AnchorTransaction> {
    try {
      const depositRequest: AnchorDepositRequest = {
        asset_code: 'USDC',
        account: walletAddress,
        amount: amount.toString(),
        type: paymentMethod.toLowerCase(),
      };

      const response = await this.httpClient.post('/sep24/transactions/deposit/interactive', depositRequest);
      const { id, url } = response.data;

      const transaction = this.anchorTransactionRepository.create({
        anchorTransactionId: id,
        type: AnchorTransactionType.DEPOSIT,
        status: AnchorTransactionStatus.PENDING,
        amount,
        currency,
        walletAddress,
        paymentMethod,
        metadata: { interactiveUrl: url },
      });

      return await this.anchorTransactionRepository.save(transaction);
    } catch (error) {
      this.logger.error('Failed to initiate deposit', error);
      throw new BadRequestException('Failed to initiate deposit');
    }
  }

  async initiateWithdrawal(
    amount: number,
    currency: string,
    walletAddress: string,
    destination: string,
  ): Promise<AnchorTransaction> {
    try {
      const withdrawRequest: AnchorWithdrawRequest = {
        asset_code: 'USDC',
        account: walletAddress,
        amount: amount.toString(),
        dest: destination,
      };

      const response = await this.httpClient.post('/sep24/transactions/withdraw/interactive', withdrawRequest);
      const { id, url } = response.data;

      const transaction = this.anchorTransactionRepository.create({
        anchorTransactionId: id,
        type: AnchorTransactionType.WITHDRAWAL,
        status: AnchorTransactionStatus.PENDING,
        amount,
        currency,
        walletAddress,
        destination,
        metadata: { interactiveUrl: url },
      });

      return await this.anchorTransactionRepository.save(transaction);
    } catch (error) {
      this.logger.error('Failed to initiate withdrawal', error);
      throw new BadRequestException('Failed to initiate withdrawal');
    }
  }

  async getTransactionStatus(transactionId: string): Promise<AnchorTransaction> {
    const transaction = await this.anchorTransactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    try {
      const response = await this.httpClient.get(`/sep24/transaction?id=${transaction.anchorTransactionId}`);
      const anchorTx: AnchorTransactionResponse = response.data.transaction;

      // Update transaction status
      transaction.status = this.mapAnchorStatus(anchorTx.status);
      transaction.stellarTransactionHash = anchorTx.stellar_transaction_id || null;
      transaction.errorMessage = anchorTx.message || null;

      return await this.anchorTransactionRepository.save(transaction);
    } catch (error) {
      this.logger.error('Failed to get transaction status', error);
      throw new BadRequestException('Failed to get transaction status');
    }
  }

  async getTransactionsByWallet(walletAddress: string): Promise<AnchorTransaction[]> {
    return await this.anchorTransactionRepository.find({
      where: { walletAddress },
      order: { createdAt: 'DESC' },
    });
  }

  private mapAnchorStatus(anchorStatus: string): AnchorTransactionStatus {
    switch (anchorStatus.toLowerCase()) {
      case 'pending_user_transfer_start':
      case 'pending_anchor':
      case 'pending_stellar':
      case 'pending_trust':
      case 'pending_user':
        return AnchorTransactionStatus.PENDING;
      case 'pending_external':
      case 'pending_receiver':
        return AnchorTransactionStatus.PROCESSING;
      case 'completed':
        return AnchorTransactionStatus.COMPLETED;
      case 'error':
      case 'no_market':
      case 'too_small':
      case 'too_large':
        return AnchorTransactionStatus.FAILED;
      default:
        return AnchorTransactionStatus.PENDING;
    }
  }
}
