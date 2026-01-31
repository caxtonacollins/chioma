/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Anchor Integration (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/anchor/deposit (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/anchor/deposit')
      .send({
        amount: 100,
        currency: 'USD',
        walletAddress: 'GTEST123',
        type: 'ACH',
      })
      .expect(401);
  });

  it('/api/v1/anchor/withdraw (POST) - should require authentication', () => {
    return request(app.getHttpServer())
      .post('/api/v1/anchor/withdraw')
      .send({
        amount: 50,
        currency: 'USD',
        destination: 'bank-account-123',
        walletAddress: 'GTEST123',
      })
      .expect(401);
  });

  it('/webhooks/anchor/transaction-status (POST) - should accept webhook', () => {
    return request(app.getHttpServer())
      .post('/webhooks/anchor/transaction-status')
      .send({
        id: 'anchor-tx-123',
        status: 'completed',
        stellar_transaction_id: 'stellar-tx-456',
      })
      .expect(200);
  });
});
