/**
 * MIT License
 * Copyright (c) 2026 caxton strange
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnchorService } from '../services/anchor.service';
import {
  AnchorTransaction,
  PaymentMethodType,
} from '../../transactions/entities/anchor-transaction.entity';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AnchorService', () => {
  let service: AnchorService;
  let repository: jest.Mocked<Repository<AnchorTransaction>>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnchorService,
        {
          provide: getRepositoryToken(AnchorTransaction),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AnchorService>(AnchorService);
    repository = module.get(getRepositoryToken(AnchorTransaction));
    configService = module.get(ConfigService);

    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        ANCHOR_API_URL: 'https://test-anchor.com',
        ANCHOR_API_KEY: 'test-key',
        ANCHOR_USDC_ASSET: 'USDC:TEST',
      };
      return config[key];
    });

    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateDeposit', () => {
    it('should create a deposit transaction', async () => {
      const mockResponse = {
        data: {
          id: 'anchor-tx-123',
          url: 'https://anchor.com/deposit/123',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const mockTransaction = {
        id: 'tx-123',
        anchorTransactionId: 'anchor-tx-123',
      } as AnchorTransaction;

      repository.create.mockReturnValue(mockTransaction);
      repository.save.mockResolvedValue(mockTransaction);

      const result = await service.initiateDeposit(
        100,
        'USD',
        'GTEST123',
        PaymentMethodType.ACH,
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/sep24/transactions/deposit/interactive',
        {
          asset_code: 'USDC',
          account: 'GTEST123',
          amount: '100',
          type: 'ach',
        },
      );

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('initiateWithdrawal', () => {
    it('should create a withdrawal transaction', async () => {
      const mockResponse = {
        data: {
          id: 'anchor-tx-456',
          url: 'https://anchor.com/withdraw/456',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const mockTransaction = {
        id: 'tx-456',
        anchorTransactionId: 'anchor-tx-456',
      } as AnchorTransaction;

      repository.create.mockReturnValue(mockTransaction);
      repository.save.mockResolvedValue(mockTransaction);

      const result = await service.initiateWithdrawal(
        50,
        'USD',
        'GTEST123',
        'bank-account-123',
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/sep24/transactions/withdraw/interactive',
        {
          asset_code: 'USDC',
          account: 'GTEST123',
          amount: '50',
          dest: 'bank-account-123',
        },
      );

      expect(result).toEqual(mockTransaction);
    });
  });
});
