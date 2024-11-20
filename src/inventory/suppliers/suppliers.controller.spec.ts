import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ItemCategory } from '../items-category/models/items-category.model';
import { Item } from '../items/models/item.model';
import { Supplier } from './models/supplier.model';
import { configuration } from 'src/shared/config/config';

describe('SuppliersController', () => {
  let controller: SuppliersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([ItemCategory, Item, Supplier]),
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
