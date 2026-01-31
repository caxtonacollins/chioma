/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { AnchorTransaction } from '../../transactions/entities/anchor-transaction.entity';
import { AnchorService } from '../services/anchor.service';
import {
  DepositRequestDto,
  WithdrawRequestDto,
  AnchorTransactionResponseDto,
} from '../dto/anchor.dto';

@Controller('api/v1/anchor')
@UseGuards(JwtAuthGuard)
export class AnchorController {
  private readonly logger = new Logger(AnchorController.name);

  constructor(private readonly anchorService: AnchorService) {}

  @Post('deposit')
  async initiateDeposit(
    @Body() depositRequest: DepositRequestDto,
    @CurrentUser() user: User,
  ): Promise<AnchorTransactionResponseDto> {
    this.logger.log(`Initiating deposit for user ${user.id}`);

    const transaction = await this.anchorService.initiateDeposit(
      depositRequest.amount,
      depositRequest.currency,
      depositRequest.walletAddress,
      depositRequest.type,
    );

    return this.mapToResponseDto(transaction);
  }

  @Post('withdraw')
  async initiateWithdrawal(
    @Body() withdrawRequest: WithdrawRequestDto,
    @CurrentUser() user: User,
  ): Promise<AnchorTransactionResponseDto> {
    this.logger.log(`Initiating withdrawal for user ${user.id}`);

    const transaction = await this.anchorService.initiateWithdrawal(
      withdrawRequest.amount,
      withdrawRequest.currency,
      withdrawRequest.walletAddress,
      withdrawRequest.destination,
    );

    return this.mapToResponseDto(transaction);
  }

  @Get('transactions/:id')
  async getTransactionStatus(
    @Param('id') transactionId: string,
    @CurrentUser() user: User,
  ): Promise<AnchorTransactionResponseDto> {
    const transaction = await this.anchorService.getTransactionStatus(transactionId);
    return this.mapToResponseDto(transaction);
  }

  @Get('transactions')
  async getTransactionsByWallet(
    @Query('walletAddress') walletAddress: string,
    @CurrentUser() user: User,
  ): Promise<AnchorTransactionResponseDto[]> {
    const transactions = await this.anchorService.getTransactionsByWallet(walletAddress);
    return transactions.map(tx => this.mapToResponseDto(tx));
  }

  private mapToResponseDto(transaction: AnchorTransaction): AnchorTransactionResponseDto {
    return {
      id: transaction.id,
      anchorTransactionId: transaction.anchorTransactionId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      walletAddress: transaction.walletAddress,
      paymentMethod: transaction.paymentMethod,
      destination: transaction.destination,
      stellarTransactionHash: transaction.stellarTransactionHash,
      errorMessage: transaction.errorMessage,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
