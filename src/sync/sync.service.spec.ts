import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { mockDeep } from 'jest-mock-extended';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { SyncRequest } from './models/sync.model';
import { getModelToken } from '@nestjs/sequelize';

describe('SyncService', () => {
  let service: SyncService;
  const syncRequestRepositoryMock = mockDeep<SyncRequest>();
  const syncQueueMock = mockDeep<Queue>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getQueueToken('sync'),
          useValue: syncQueueMock,
        },
        {
          provide: getModelToken(SyncRequest),
          useValue: syncRequestRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
