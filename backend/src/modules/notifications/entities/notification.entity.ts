import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean; // Se guardará como is_read en la DB

  @Column({ nullable: true })
  type: string; // Ej: 'PAYMENT_RECEIVED', 'CONTRACT_SIGNED'

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}