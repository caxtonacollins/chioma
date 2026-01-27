import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../users/entities/user.entity';

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string | null;

  @Exclude()
  @Column({ name: 'key_hash' })
  keyHash: string;

  @Column({ name: 'key_prefix' })
  keyPrefix: string; // First 8 chars for identification

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'simple-array',
    default: ApiKeyScope.READ,
  })
  scopes: ApiKeyScope[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'last_used_ip', nullable: true })
  lastUsedIp: string | null;

  @Column({ name: 'rate_limit', default: 1000 })
  rateLimit: number; // Requests per hour

  @Column({ name: 'request_count', default: 0 })
  requestCount: number;

  @Column({ name: 'rate_limit_reset_at', nullable: true })
  rateLimitResetAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
