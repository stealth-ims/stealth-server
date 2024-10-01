import { Test, TestingModule } from '@nestjs/testing';
import { FacilityController } from './facility.controller';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { configuration } from '../../shared/config/config';
import { Facility } from './models/facility.model';
import { FacilityService } from './facility.service';

describe('FacilityController', () => {
  let controller: FacilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
        SequelizeModule.forFeature([Facility]),
      ],
      controllers: [FacilityController],
      providers: [FacilityService],
    }).compile();

    controller = module.get<FacilityController>(FacilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
