import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './items.controller';
import { ItemService } from './items.service';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Supplier } from '../suppliers/models/supplier.model';
import { Item } from './models/item.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { configuration } from 'src/shared/config/config';
import { BatchService } from './batch.service';
import { Batch } from './models';

describe('ItemsController', () => {
  let controller: ItemController;
  // let testItem: ItemResponse;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),

        SequelizeModule.forFeature([Item, Batch, Supplier]),
      ],
      controllers: [ItemController],
      providers: [ItemService, SuppliersService, BatchService],
    }).compile();

    controller = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('create', () => {
  //   const createItemDto: CreateItemDto = {
  //     name: 'testItem',
  //     brandName: 'P2',
  //     stock: 100,
  //     costPrice: 34.23,
  //     sellingPrice: 50,
  //     dosageForm: DosageForm.SOLIDS,
  //     code: 'GU-343',
  //     fdaApproval: 'hi y3-24-3',
  //     ISO: 'ISO9000',
  //     batch: '388932',
  //     strength: 'Strong',
  //     reorderPoint: 20,
  //     validity: new Date(),
  //     unitOfMeasurement: 'g',
  //     manufacturer: 'King a farmer',
  //     storageReq: 'Storage requiremtn',
  //     categoryId: 'bd8e7e44-e142-4b26-a1e1-cd9af9d072ff',
  //     supplierId: 'e76ccef6-72a8-4c7e-b8f1-49868526a83e',
  //     facilityId: '6e242fa9-dbbf-4599-9c04-97285c710144',
  //     departmentId: 'f8db9c0e-0df7-4c78-886d-665f8482a20e',
  //   };
  //   it('should create a new item', async () => {
  //     const result = await controller.create(createItemDto);

  //     testItem = result.data;
  //     expect(result.statusCode).toBe(HttpStatus.CREATED);
  //     expect(result).toBeDefined();
  //     expect(testItem.id).toBeDefined();
  //     expect(testItem.name).toEqual(createItemDto.name);
  //   });

  //   it('should throw a unique name error', async () => {
  //     try {
  //       await controller.create(createItemDto);
  //     } catch (error) {
  //       expect(error).toBeDefined();
  //       expect((error as ConflictException).getStatus()).toBe(
  //         HttpStatus.CONFLICT,
  //       );
  //       expect(error).toBeInstanceOf(ConflictException);
  //     }
  //   });
  // });

  // describe('findAll', () => {
  //   it('should retrieve all items', async () => {
  //     const query = new ItemPaginationDto();
  //     query.pageSize = 4;

  //     const result = await controller.findAll(query);
  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.FOUND);
  //     expect(result.data.rows.length).toEqual(query.pageSize);
  //   });
  // });

  // // Not implemented
  // // describe('analytics', () => {
  // //   it('should retrieve item analytics', async () => {
  // //     const result = await controller.analytics();

  // //     expect(result).toBeDefined();
  // //     // Add more assertions to validate the result
  // //   });
  // // });
  // describe('update', () => {
  //   it('should update a specific item', async () => {
  //     testItem.brandName = 'p8';
  //     testItem.costPrice = 40;
  //     const result = await controller.update(testItem.id, {
  //       brandName: testItem.brandName,
  //       costPrice: testItem.costPrice,
  //     });

  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
  //   });
  // });

  // describe('findOne', () => {
  //   it('should retrieve a specific item', async () => {
  //     const result = await controller.findOne(testItem.id);

  //     expect(result).toBeDefined();
  //     expect(result.data.brandName).toEqual(testItem.brandName);
  //     expect(result.data.costPrice).toEqual(testItem.costPrice);
  //   });

  //   it('should fail to get a non-existent item', async () => {
  //     try {
  //       await controller.findOne('edb91c5a-9594-4301-898f-e6e55ede5f84');
  //     } catch (error) {
  //       expect(error).toBeDefined();
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });
  // });

  // describe('remove', () => {
  //   it('should delete a specific item', async () => {
  //     const result = await controller.remove(testItem.id);

  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
  //   });

  //   it('should fail to get a deleted item', async () => {
  //     try {
  //       await controller.remove(testItem.id);
  //     } catch (error) {
  //       expect(error).toBeDefined();
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });
  // });
});
