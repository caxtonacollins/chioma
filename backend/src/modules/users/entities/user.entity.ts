import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RentContract } from '../../rent/entities/rent-contract.entity'; // Verifica esta ruta

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // ESTO ES LO QUE FALTA:
  @OneToMany(() => RentContract, (contract) => contract.user)
  contracts: RentContract[];

  @CreateDateColumn()
  createdAt: Date;
}