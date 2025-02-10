import { Test, TestingModule } from '@nestjs/testing';
import { ItemCategoryController } from './items-category.controller';
import { ItemCategoryService } from './items-category.service';

describe('ItemsCategoryController', () => {
  let controller: ItemCategoryController;

  let service: ItemCategoryService;
  const mockItemCategoryService = {};

  // formalities
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemCategoryController],
      providers: [
        { provide: ItemCategoryService, useValue: mockItemCategoryService },
      ],
    }).compile();

    controller = module.get<ItemCategoryController>(ItemCategoryController);
    service = module.get<ItemCategoryService>(ItemCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // it('should create a new item category', async () => {
  //   const res = await controller.create({ name: 'test' });
  //   testCategory = res.data;
  //   expect(res.statusCode).toEqual(HttpStatus.CREATED);
  //   expect(testCategory.name).toEqual('test');
  //   expect(testCategory.status).toBe(ItemsCategoryStatus.ACTIVE);
  // });

  // it('should throw unique name error', async () => {
  //   try {
  //     await controller.create({ name: 'test' });
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(ConflictException);
  //     expect((error as ConflictException).getStatus()).toBe(
  //       HttpStatus.CONFLICT,
  //     );
  //   }
  // });

  // it('should retrieve item categories', async () => {
  //   const filter = new PaginationRequestDto();
  //   filter.pageSize = 4;
  //   const res = await controller.findAll(filter);
  //   expect(res.statusCode).toBe(HttpStatus.OK);
  //   expect(res.data.pageSize).toEqual(filter.pageSize);
  // });

  // it('should update the created item category', async () => {
  //   testCategory.name = 'changed';
  //   testCategory.status = ItemsCategoryStatus.DEACTIVATED;
  //   const res = await controller.update(testCategory.id, {
  //     name: testCategory.name,
  //     status: testCategory.status,
  //   });
  //   expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  // });

  // it('should find a item category and test updated values', async () => {
  //   const res = await controller.findOne(testCategory.id);
  //   expect(res.statusCode).toBe(HttpStatus.OK);
  //   expect(res.data.status).toBe(testCategory.status);
  //   expect(res.data.name).toBe(testCategory.name);
  // });

  // it('should delete a item category', async () => {
  //   const res = await controller.remove(testCategory.id);
  //   expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  // });

  // it('should fail getting a deleted item', async () => {
  //   try {
  //     await controller.remove(testCategory.id);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(NotFoundException);
  //   }
  // });
});
