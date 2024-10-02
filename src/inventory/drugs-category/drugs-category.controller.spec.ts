import { Test, TestingModule } from '@nestjs/testing';
import { DrugsCategoryController } from './drugs-category.controller';
import { DrugsCategoryService } from './drugs-category.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  DrugsCategory,
  DrugsCategoryStatus,
} from './models/drugs-category.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/interface/jwt.config';
import { Drug } from '../drugs/models/drug.model';
import { Supplier } from '../suppliers/models/supplier.model';
import {
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { IndexModels } from 'src/shared/models/index.models';

const DB_USER = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_HOST = 'localhost';
const DB_PORT = 5432;
const DB_NAME = 'stealth_db';

describe('DrugsCategoryController', () => {
  let controller: DrugsCategoryController;

  let testCategory: DrugsCategory;

  // formalities
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
          models: [...IndexModels],
        }),
        SequelizeModule.forFeature([DrugsCategory, Drug, Supplier]),
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [DrugsCategoryController],
      providers: [DrugsCategoryService],
    }).compile();
    controller = module.get<DrugsCategoryController>(DrugsCategoryController);
  });

  it('should create a new drug category', async () => {
    const res = await controller.create({ name: 'test' });
    testCategory = res.data;
    expect(res.statusCode).toEqual(HttpStatus.CREATED);
    expect(testCategory.name).toEqual('test');
    expect(testCategory.status).toBe(DrugsCategoryStatus.ACTIVE);
  });

  it('should throw unique name error', async () => {
    try {
      await controller.create({ name: 'test' });
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect((error as InternalServerErrorException).getStatus()).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  });

  it('should retrieve drug categories', async () => {
    const filter = new PaginationRequestDto();
    filter.pageSize = 4;
    const res = await controller.findAll(filter);
    expect(res.statusCode).toBe(HttpStatus.FOUND);
    expect(res.data.pageSize).toEqual(filter.pageSize);
  });

  it('should update the created drug category', async () => {
    testCategory.name = 'changed';
    testCategory.status = DrugsCategoryStatus.DEACTIVATED;
    const res = await controller.update(testCategory.id, {
      name: testCategory.name,
      status: testCategory.status,
    });
    expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  });

  it('should find a drug category and test updated values', async () => {
    const res = await controller.findOne(testCategory.id);
    expect(res.statusCode).toBe(HttpStatus.FOUND);
    expect(res.data.status).toBe(testCategory.status);
    expect(res.data.name).toBe(testCategory.name);
  });

  it('should delete a drug category', async () => {
    const res = await controller.remove(testCategory.id);
    expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
  });

  it('should fail getting a deleted drug', async () => {
    try {
      await controller.remove(testCategory.id);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
});
