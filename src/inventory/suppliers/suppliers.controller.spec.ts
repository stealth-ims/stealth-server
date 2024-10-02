import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import jwtConfig from 'src/auth/interface/jwt.config';
import { DrugsCategory } from '../drugs-category/models/drugs-category.model';
import { Drug } from '../drugs/models/drug.model';
import { Supplier } from './models/supplier.model';
import { IndexModels } from 'src/shared/models/index.models';

const DB_USER = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_HOST = 'localhost';
const DB_PORT = 5432;
const DB_NAME = 'stealth_db';

describe('SuppliersController', () => {
  let controller: SuppliersController;

  beforeEach(async () => {
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
      controllers: [SuppliersController],
      providers: [SuppliersService],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
