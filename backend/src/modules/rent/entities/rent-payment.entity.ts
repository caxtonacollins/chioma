import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { RentContract } from './rent-contract.entity';

@Entity('rent_payments')
export class RentPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => RentContract, (contract) => contract.payments)
  contract: RentContract;

  @CreateDateColumn()
  paidAt: Date;
}