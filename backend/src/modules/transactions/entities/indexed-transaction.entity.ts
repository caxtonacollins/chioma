import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('indexed_transactions')
export class IndexedTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  hash: string;

  @Column('decimal', { precision: 20, scale: 8 })
  value: number;

  @CreateDateColumn()
  indexedAt: Date;
}