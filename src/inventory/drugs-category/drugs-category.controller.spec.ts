import { Test, TestingModule } from '@nestjs/testing';
import { DrugsCategoryController } from './drugs-category.controller';
import { DrugsCategoryService } from './drugs-category.service';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { configuration } from 'src/shared/config/config';
import { DrugsCategory } from './models/drugs-category.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/interface/jwt.config';
import { Drug } from '../drugs/models/drug.model';
import { Supplier } from '../suppliers/models/supplier.model';

describe('DrugsCategoryController', () => {
  let controller: DrugsCategoryController;
  let service: DrugsCategoryService;

  // formalities
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([DrugsCategory, Drug, Supplier]),
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
      ],
      controllers: [DrugsCategoryController],
      providers: [DrugsCategoryService],
    }).compile();
    controller = module.get<DrugsCategoryController>(DrugsCategoryController);
    service = module.get<DrugsCategoryService>(DrugsCategoryService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('service should be defined', () => {
    expect(service).toBeDefined();
  });
});
