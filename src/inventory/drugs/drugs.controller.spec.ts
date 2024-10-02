import { Test, TestingModule } from '@nestjs/testing';
import { DrugsController } from './drugs.controller';
import { DrugsService } from './drugs.service';
import { DrugsCategory } from '../drugs-category/models/drugs-category.model';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Supplier } from '../suppliers/models/supplier.model';
import { Drug } from './models/drug.model';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Department } from 'src/admin/department/models/department.model';
import { FacilityService } from 'src/admin/facility/facility.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { configuration } from 'src/shared/config/config';

describe('DrugsController', () => {
  let controller: DrugsController;
  // let testDrug: DrugResponse;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),

        SequelizeModule.forFeature([
          DrugsCategory,
          Drug,
          Supplier,
          Facility,
          Department,
        ]),
        // ConfigModule.forFeature(jwtConfig),
        // JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [DrugsController],
      providers: [
        DrugsService,
        DrugsCategoryService,
        SuppliersService,
        FacilityService,
        DepartmentService,
      ],
    }).compile();

    controller = module.get<DrugsController>(DrugsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('create', () => {
  //   const createDrugDto: CreateDrugDto = {
  //     name: 'testDrug',
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
  //   it('should create a new drug', async () => {
  //     const result = await controller.create(createDrugDto);

  //     testDrug = result.data;
  //     expect(result.statusCode).toBe(HttpStatus.CREATED);
  //     expect(result).toBeDefined();
  //     expect(testDrug.id).toBeDefined();
  //     expect(testDrug.name).toEqual(createDrugDto.name);
  //   });

  //   it('should throw a unique name error', async () => {
  //     try {
  //       await controller.create(createDrugDto);
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
  //   it('should retrieve all drugs', async () => {
  //     const query = new DrugPaginationDto();
  //     query.pageSize = 4;

  //     const result = await controller.findAll(query);
  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.FOUND);
  //     expect(result.data.rows.length).toEqual(query.pageSize);
  //   });
  // });

  // // Not implemented
  // // describe('analytics', () => {
  // //   it('should retrieve drug analytics', async () => {
  // //     const result = await controller.analytics();

  // //     expect(result).toBeDefined();
  // //     // Add more assertions to validate the result
  // //   });
  // // });
  // describe('update', () => {
  //   it('should update a specific drug', async () => {
  //     testDrug.brandName = 'p8';
  //     testDrug.costPrice = 40;
  //     const result = await controller.update(testDrug.id, {
  //       brandName: testDrug.brandName,
  //       costPrice: testDrug.costPrice,
  //     });

  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
  //   });
  // });

  // describe('findOne', () => {
  //   it('should retrieve a specific drug', async () => {
  //     const result = await controller.findOne(testDrug.id);

  //     expect(result).toBeDefined();
  //     expect(result.data.brandName).toEqual(testDrug.brandName);
  //     expect(result.data.costPrice).toEqual(testDrug.costPrice);
  //   });

  //   it('should fail to get a non-existent drug', async () => {
  //     try {
  //       await controller.findOne('edb91c5a-9594-4301-898f-e6e55ede5f84');
  //     } catch (error) {
  //       expect(error).toBeDefined();
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });
  // });

  // describe('remove', () => {
  //   it('should delete a specific drug', async () => {
  //     const result = await controller.remove(testDrug.id);

  //     expect(result).toBeDefined();
  //     expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
  //   });

  //   it('should fail to get a deleted drug', async () => {
  //     try {
  //       await controller.remove(testDrug.id);
  //     } catch (error) {
  //       expect(error).toBeDefined();
  //       expect(error).toBeInstanceOf(NotFoundException);
  //     }
  //   });
  // });
});
