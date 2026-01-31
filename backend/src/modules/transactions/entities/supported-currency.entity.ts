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
} from 'typeorm';

@Entity('supported_currencies')
export class SupportedCurrency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3, unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  minAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  maxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  fee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
