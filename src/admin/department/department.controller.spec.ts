import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { configuration } from '../../shared/config/config';
import { Department } from './models/department.model';
import { DepartmentService } from './department.service';

describe('DepartmentController', () => {
  let controller: DepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([Department]),
      ],
      controllers: [DepartmentController],
      providers: [DepartmentService],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
