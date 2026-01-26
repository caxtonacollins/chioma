import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'account_id', length: 56 })
  accountId: string;

  @Column({ name: 'account_type', type: 'smallint' })
  accountType: number;

  @Column({ name: 'data_hash', length: 128 })
  dataHash: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'profile_json', type: 'jsonb' })
  profileJson: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
