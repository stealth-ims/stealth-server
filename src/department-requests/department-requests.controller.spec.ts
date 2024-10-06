import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentRequestsController } from './department-requests.controller';
import { DepartmentRequestsService } from './department-requests.service';

describe('DepartmentRequestsController', () => {
  let controller: DepartmentRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentRequestsController],
      providers: [DepartmentRequestsService],
    }).compile();

    controller = module.get<DepartmentRequestsController>(
      DepartmentRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
