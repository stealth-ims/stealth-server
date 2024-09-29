import { Test, TestingModule } from '@nestjs/testing';
import { DrugsController } from './drugs.controller';
import { DrugsService } from './drugs.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/interface/jwt.config';
import { DrugsCategory } from '../drugs-category/models/drugs-category.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Supplier } from '../suppliers/models/supplier.model';
import { DosageForm, Drug } from './models/drug.model';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateDrugDto, DrugPaginationDto, DrugResponse } from './dto';
import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

const DB_USER = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_HOST = 'localhost';
const DB_PORT = 5432;
const DB_NAME = 'stealth_db';

describe('DrugsController', () => {
  let controller: DrugsController;
  let testDrug: DrugResponse;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          password: DB_PASSWORD,
          username: DB_USER,
          host: DB_HOST,
          port: DB_PORT,
          database: DB_NAME,
          dialect: 'postgres',
          ssl: false,
          dialectOptions: {
            ssl: false,
          },
          logging: false,
          models: [DrugsCategory, Drug, Supplier],
        }),
        SequelizeModule.forFeature([DrugsCategory, Drug, Supplier]),
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [DrugsController],
      providers: [DrugsService, DrugsCategoryService, SuppliersService],
    }).compile();

    controller = module.get<DrugsController>(DrugsController);
  });

  describe('create', () => {
    const createDrugDto: CreateDrugDto = {
      name: 'testDrug',
      brandName: 'P2',
      stock: 100,
      costPrice: 34.23,
      sellingPrice: 50,
      dosageForm: DosageForm.SOLIDS,
      code: 'GU-343',
      fdaApproval: 'hi y3-24-3',
      ISO: 'ISO9000',
      batch: '388932',
      strength: 'Strong',
      reorderPoint: 20,
      validity: new Date(),
      unitOfMeasurement: 'g',
      manufacturer: 'King a farmer',
      storageReq: 'Storage requiremtn',
      categoryId: 'a8398b52-c89d-447a-b103-654225e53a4e',
      supplierId: 'edb91c5a-9594-4301-898f-e6e55ede5f84',
    };
    it('should create a new drug', async () => {
      const result = await controller.create(createDrugDto);

      testDrug = result.data;
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result).toBeDefined();
      expect(testDrug.id).toBeDefined();
      expect(testDrug.name).toEqual(createDrugDto.name);
    });

    it('should throw a unique name error', async () => {
      try {
        await controller.create(createDrugDto);
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as ConflictException).getStatus()).toBe(
          HttpStatus.CONFLICT,
        );
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
  });

  describe('findAll', () => {
    it('should retrieve all drugs', async () => {
      const query = new DrugPaginationDto();
      query.pageSize = 4;

      const result = await controller.findAll(query);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(HttpStatus.FOUND);
      expect(result.data.rows.length).toEqual(query.pageSize);
    });
  });

  // Not implemented
  // describe('analytics', () => {
  //   it('should retrieve drug analytics', async () => {
  //     const result = await controller.analytics();

  //     expect(result).toBeDefined();
  //     // Add more assertions to validate the result
  //   });
  // });
  describe('update', () => {
    it('should update a specific drug', async () => {
      testDrug.brandName = 'p8';
      testDrug.costPrice = 40;
      const result = await controller.update(testDrug.id, {
        brandName: testDrug.brandName,
        costPrice: testDrug.costPrice,
      });

      expect(result).toBeDefined();
      expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
    });
  });

  describe('findOne', () => {
    it('should retrieve a specific drug', async () => {
      const result = await controller.findOne(testDrug.id);

      expect(result).toBeDefined();
      expect(result.data.brandName).toEqual(testDrug.brandName);
      expect(result.data.costPrice).toEqual(testDrug.costPrice);
    });

    it('should fail to get a non-existent drug', async () => {
      try {
        await controller.findOne('edb91c5a-9594-4301-898f-e6e55ede5f84');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('remove', () => {
    it('should delete a specific drug', async () => {
      const result = await controller.remove(testDrug.id);

      expect(result).toBeDefined();
      expect(result.statusCode).toBe(HttpStatus.ACCEPTED);
    });

    it('should fail to get a deleted drug', async () => {
      try {
        await controller.remove(testDrug.id);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
