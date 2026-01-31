/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AnchorTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AnchorTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum PaymentMethodType {
  SEPA = 'SEPA',
  SWIFT = 'SWIFT',
  ACH = 'ACH',
}

@Entity('anchor_transactions')
@Index(['walletAddress'])
@Index(['status'])
@Index(['type'])
export class AnchorTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  anchorTransactionId: string;

  @Column({
    type: 'enum',
    enum: AnchorTransactionType,
  })
  type: AnchorTransactionType;

  @Column({
    type: 'enum',
    enum: AnchorTransactionStatus,
    default: AnchorTransactionStatus.PENDING,
  })
  status: AnchorTransactionStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar' })
  walletAddress: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    nullable: true,
  })
  paymentMethod: PaymentMethodType;

  @Column({ type: 'text', nullable: true })
  destination: string;

  @Column({ type: 'varchar', nullable: true })
  stellarTransactionHash: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
