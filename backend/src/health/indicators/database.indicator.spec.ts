import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthCheckError } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.indicator';

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;
  let mockDataSource: Partial<DataSource>;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn(),
      initialize: jest.fn(),
      options: {
        database: 'test_db',
        type: 'postgres',
      } as any,
    };

    // Mock the isInitialized property
    Object.defineProperty(mockDataSource, 'isInitialized', {
      value: true,
      writable: true,
      configurable: true,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthIndicator,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    indicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('isHealthy', () => {
    it('should return healthy status when database is accessible', async () => {
      jest.spyOn(mockDataSource, 'query').mockResolvedValue([{ '?column?': 1 }]);

      const result = await indicator.isHealthy('database');

      expect(result).toMatchObject({
        database: {
          status: 'up',
          responseTime: expect.any(Number),
          connection: 'active',
          database: 'test_db',
          type: 'postgres',
        },
      });
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should initialize connection if not initialized', async () => {
      Object.defineProperty(mockDataSource, 'isInitialized', {
        value: false,
        writable: true,
        configurable: true,
      });
      
      jest.spyOn(mockDataSource, 'initialize').mockResolvedValue(mockDataSource as DataSource);
      jest.spyOn(mockDataSource, 'query').mockResolvedValue([{ '?column?': 1 }]);

      const result = await indicator.isHealthy('database');

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(result).toMatchObject({
        database: {
          status: 'up',
          connection: 'active',
        },
      });
    });

    it('should throw HealthCheckError when database is not accessible', async () => {
      const mockError = new Error('Connection failed');
      jest.spyOn(mockDataSource, 'query').mockRejectedValue(mockError);

      await expect(indicator.isHealthy('database')).rejects.toThrow(HealthCheckError);
    });

    it('should handle initialization failure', async () => {
      Object.defineProperty(mockDataSource, 'isInitialized', {
        value: false,
        writable: true,
        configurable: true,
      });
      
      const mockError = new Error('Initialization failed');
      jest.spyOn(mockDataSource, 'initialize').mockRejectedValue(mockError);

      await expect(indicator.isHealthy('database')).rejects.toThrow(HealthCheckError);
    });
  });

  describe('checkConnection', () => {
    it('should return true when connection is successful', async () => {
      jest.spyOn(mockDataSource, 'query').mockResolvedValue([{ '?column?': 1 }]);

      const result = await indicator.checkConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      const mockError = new Error('Connection failed');
      jest.spyOn(mockDataSource, 'query').mockRejectedValue(mockError);

      const result = await indicator.checkConnection();

      expect(result).toBe(false);
    });

    it('should initialize connection if needed', async () => {
      Object.defineProperty(mockDataSource, 'isInitialized', {
        value: false,
        writable: true,
        configurable: true,
      });
      
      jest.spyOn(mockDataSource, 'initialize').mockResolvedValue(mockDataSource as DataSource);
      jest.spyOn(mockDataSource, 'query').mockResolvedValue([{ '?column?': 1 }]);

      const result = await indicator.checkConnection();

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});