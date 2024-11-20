import { Test, TestingModule } from '@nestjs/testing';
import { ItemCategoryController } from './items-category.controller';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ItemCategory } from './models/items-category.model';
import { Item } from '../items/models/item.model';
import { Supplier } from '../suppliers/models/supplier.model';
import { configuration } from 'src/shared/config/config';
import { ItemCategoryService } from './items-category.service';

describe('ItemsCategoryController', () => {
  let controller: ItemCategoryController;

  // let testCategory: ItemsCategory;

  // formalities
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([ItemCategory, Item, Supplier]),
        // ConfigModule.forFeature(jwtConfig),
        // JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [ItemCategoryController],
      providers: [ItemCategoryService],
    }).compile();
    controller = module.get<ItemCategoryController>(ItemCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
  //   expect(res.statusCode).toBe(HttpStatus.FOUND);
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
  //   expect(res.statusCode).toBe(HttpStatus.FOUND);
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
