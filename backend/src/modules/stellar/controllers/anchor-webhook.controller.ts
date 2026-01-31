/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AnchorService } from '../services/anchor.service';

interface AnchorWebhookPayload {
  id: string;
  status: string;
  stellar_transaction_id?: string;
  message?: string;
  amount_in?: string;
  amount_out?: string;
  amount_fee?: string;
}

@Controller('webhooks/anchor')
export class AnchorWebhookController {
  private readonly logger = new Logger(AnchorWebhookController.name);

  constructor(private readonly anchorService: AnchorService) {}

  @Post('transaction-status')
  @HttpCode(HttpStatus.OK)
  async handleTransactionStatusUpdate(
    @Body() payload: AnchorWebhookPayload,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Received webhook for transaction ${payload.id}`);

      // Find and update the transaction
      await this.anchorService.getTransactionStatus(payload.id);

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to process webhook', error);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}
