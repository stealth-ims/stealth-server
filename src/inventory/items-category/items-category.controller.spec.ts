import { Test, TestingModule } from '@nestjs/testing';
import { DrugsCategoryController } from './items-category.controller';
import { DrugsCategoryService } from './items-category.service';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ItemCategory } from './models/items-category.model';
import { Item } from '../items/models/item.model';
import { Supplier } from '../suppliers/models/supplier.model';
import { configuration } from 'src/shared/config/config';

describe('DrugsCategoryController', () => {
  let controller: DrugsCategoryController;

  // let testCategory: DrugsCategory;

  // formalities
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([ItemCategory, Item, Supplier]),
        // ConfigModule.forFeature(jwtConfig),
        // JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [DrugsCategoryController],
      providers: [DrugsCategoryService],
    }).compile();
    controller = module.get<DrugsCategoryController>(DrugsCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should create a new drug category', async () => {
  //   const res = await controller.create({ name: 'test' });
  //   testCategory = res.data;
  //   expect(res.statusCode).toEqual(HttpStatus.CREATED);
  //   expect(testCategory.name).toEqual('test');
  //   expect(testCategory.status).toBe(DrugsCategoryStatus.ACTIVE);
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

  // it('should retrieve drug categories', async () => {
  //   const filter = new PaginationRequestDto();
  //   filter.pageSize = 4;
  //   const res = await controller.findAll(filter);
  //   expect(res.statusCode).toBe(HttpStatus.FOUND);
  //   expect(res.data.pageSize).toEqual(filter.pageSize);
  // });

  // it('should update the created drug category', async () => {
  //   testCategory.name = 'changed';
  //   testCategory.status = DrugsCategoryStatus.DEACTIVATED;
  //   const res = await controller.update(testCategory.id, {
  //     name: testCategory.name,
  //     status: testCategory.status,
  //   });
  //   expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  // });

  // it('should find a drug category and test updated values', async () => {
  //   const res = await controller.findOne(testCategory.id);
  //   expect(res.statusCode).toBe(HttpStatus.FOUND);
  //   expect(res.data.status).toBe(testCategory.status);
  //   expect(res.data.name).toBe(testCategory.name);
  // });

  // it('should delete a drug category', async () => {
  //   const res = await controller.remove(testCategory.id);
  //   expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  // });

  // it('should fail getting a deleted drug', async () => {
  //   try {
  //     await controller.remove(testCategory.id);
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(NotFoundException);
  //   }
  // });
});
