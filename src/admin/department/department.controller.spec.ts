import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let service: DepartmentService;

  const mockDepartmentService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        { provide: DepartmentService, useValue: mockDepartmentService },
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
