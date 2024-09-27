import { Test, TestingModule } from '@nestjs/testing';
import { DrugsCategoryController } from './drugs-category.controller';
import { DrugsCategoryService } from './drugs-category.service';

describe('DrugsCategoryController', () => {
  let controller: DrugsCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugsCategoryController],
      providers: [DrugsCategoryService],
    }).compile();

    controller = module.get<DrugsCategoryController>(DrugsCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
