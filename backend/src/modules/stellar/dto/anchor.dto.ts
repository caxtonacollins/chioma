/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import { IsNumber, IsString, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { PaymentMethodType } from '../../transactions/entities/anchor-transaction.entity';

export class DepositRequestDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;
}

export class WithdrawRequestDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class AnchorTransactionResponseDto {
  id: string;
  anchorTransactionId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  walletAddress: string;
  paymentMethod?: PaymentMethodType;
  destination?: string;
  stellarTransactionHash?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
