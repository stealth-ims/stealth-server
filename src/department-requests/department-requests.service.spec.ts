import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentRequestsService } from './department-requests.service';

describe('DepartmentRequestsService', () => {
  let service: DepartmentRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentRequestsService],
    }).compile();

    service = module.get<DepartmentRequestsService>(DepartmentRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
