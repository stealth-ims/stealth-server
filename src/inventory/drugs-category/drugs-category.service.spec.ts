import { Test, TestingModule } from '@nestjs/testing';
import { DrugsCategoryService } from './drugs-category.service';

describe('DrugsCategoryService', () => {
  let service: DrugsCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrugsCategoryService],
    }).compile();

    service = module.get<DrugsCategoryService>(DrugsCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
