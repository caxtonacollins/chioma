import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ default: true })
  isActive: boolean;
}