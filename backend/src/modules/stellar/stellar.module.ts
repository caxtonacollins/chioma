import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { StellarController } from './controllers/stellar.controller';

import { AnchorService } from './services/anchor-service';
import { EscrowService } from './services/escrow.service';
import { StellarService } from './services/stellar.service';
import { EncryptionService } from './services/encryption.service';

import { AnchorTransaction } from './entities/anchor-transaction.entity';
import { SupportedCurrency } from './entities/supported-currency.entity';
import { StellarAccount } from './entities/stellar-account.entity';
import { StellarTransaction } from './entities/stellar-transaction.entity';
import { StellarEscrow } from './entities/stellar-escrow.entity';

import { User } from '../users/entities/user.entity';

import stellarConfig from './config/stellar.config';

@Module({
  imports: [
    // Stellar-specific config
    ConfigModule.forFeature(stellarConfig),

    // TypeORM entities (merged)
    TypeOrmModule.forFeature([
      AnchorTransaction,
      SupportedCurrency,
      StellarAccount,
      StellarTransaction,
      StellarEscrow,
      User,
    ]),

    // HTTP calls (Anchor / Horizon / external services)
    HttpModule,

    // Cron / background jobs
    ScheduleModule.forRoot(),
  ],
  controllers: [StellarController],
  providers: [
    AnchorService,
    EscrowService,
    StellarService,
    EncryptionService,
  ],
  exports: [
    AnchorService,
    EscrowService,
    StellarService,
    EncryptionService,
  ],
})
export class StellarModule {}
