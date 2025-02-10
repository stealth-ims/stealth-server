import { Test, TestingModule } from '@nestjs/testing';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';

describe('FacilityController', () => {
  let controller: FacilityController;
  let service: FacilityService;

  const mockFacilityService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityController],
      providers: [{ provide: FacilityService, useValue: mockFacilityService }],
    }).compile();

    controller = module.get<FacilityController>(FacilityController);
    service = module.get<FacilityService>(FacilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
