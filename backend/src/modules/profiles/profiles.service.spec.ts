import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProfilesService } from './profiles.service';
import { UserProfile } from './entities/user-profile.entity';
import { IpfsService } from './ipfs.service';
import { StellarProfileService } from './stellar-profile.service';

const stellarPublicKey =
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let ipfsService: { addJson: jest.Mock };
  let stellarService: {
    getOnChainProfile: jest.Mock;
    submitSignedTransaction: jest.Mock;
    getDataKey: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((value) => value),
    };
    ipfsService = { addJson: jest.fn() };
    stellarService = {
      getOnChainProfile: jest.fn(),
      submitSignedTransaction: jest.fn(),
      getDataKey: jest.fn().mockReturnValue('chioma_profile'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(UserProfile), useValue: repository },
        { provide: IpfsService, useValue: ipfsService },
        { provide: StellarProfileService, useValue: stellarService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((_, fallback) => fallback),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ProfilesService);
  });

  it('prepares profile update and SEP-29 payload', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    stellarService.getOnChainProfile.mockResolvedValue(null);
    ipfsService.addJson.mockResolvedValue('bafybeigdyrzt6profilehash');
    repository.findOne.mockResolvedValue(null);
    repository.save.mockResolvedValue({
      id: 'profile-id',
      userId: 'user-id',
      accountId: stellarPublicKey,
      accountType: 1,
      dataHash: 'bafybeigdyrzt6profilehash',
      displayName: 'Chioma',
      email: null,
      avatarUrl: null,
      profileJson: { displayName: 'Chioma' },
      updatedAt: new Date(),
    });

    const result = await service.updateProfile('user-id', {
      displayName: 'Chioma',
      accountType: 1,
      stellarPublicKey,
      email: undefined,
      avatarUrl: undefined,
    });

    expect(result.dataKey).toBe('chioma_profile');
    expect(result.dataValueXdr).toBeDefined();
    expect(result.dataHash).toBe('bafybeigdyrzt6profilehash');
  });

  it('rejects invalid account type', async () => {
    await expect(
      service.updateProfile('user-id', {
        displayName: 'Chioma',
        accountType: 4,
        stellarPublicKey,
      }),
    ).rejects.toThrow('Invalid account type');
  });

  it('rejects large data hash', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    stellarService.getOnChainProfile.mockResolvedValue(null);
    ipfsService.addJson.mockResolvedValue('x'.repeat(256));

    await expect(
      service.updateProfile('user-id', {
        displayName: 'Chioma',
        accountType: 1,
        stellarPublicKey,
      }),
    ).rejects.toThrow('Data hash too large');
  });

  it('rate limits profile updates', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    stellarService.getOnChainProfile.mockResolvedValue({
      version: '1.0',
      type: 1,
      updated: 1700000000,
      data_hash: 'bafybeigdyrzt6profilehash',
    });

    await expect(
      service.updateProfile('user-id', {
        displayName: 'Chioma',
        accountType: 1,
        stellarPublicKey,
      }),
    ).rejects.toThrow('Profile update rate limited');
  });

  it('submits signed transaction', async () => {
    stellarService.submitSignedTransaction.mockResolvedValue('tx-hash');

    const result = await service.submitOnChainUpdate('signed-xdr');
    expect(result.hash).toBe('tx-hash');
  });
});
