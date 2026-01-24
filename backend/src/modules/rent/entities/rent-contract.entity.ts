import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RentPayment } from './rent-payment.entity';

@Entity('rent_contracts')
export class RentContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyAddress: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => User, (user) => user.contracts)
  user: User;

  @OneToMany(() => RentPayment, (payment) => payment.contract)
  payments: RentPayment[];
}