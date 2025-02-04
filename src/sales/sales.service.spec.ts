import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { Sale } from './models/sales.models';
import { getModelToken } from '@nestjs/sequelize';
import { BatchService } from '../inventory/items/batches/batch.service';
import { PatientService } from '../patient/patient.service';

describe('SalesService', () => {
  let service: SalesService;
  let batchService: BatchService;
  let patientService: PatientService;
  let model: typeof Sale;
  const mockSaleModel = {};
  const mockBatchService = {};
  const mockPatientService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getModelToken(Sale), useValue: mockSaleModel },
        { provide: BatchService, useValue: mockBatchService },
        { provide: PatientService, useValue: mockPatientService },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    batchService = module.get<BatchService>(BatchService);
    patientService = module.get<PatientService>(PatientService);
    model = module.get<typeof Sale>(getModelToken(Sale));
  });

  it('should be defined', () => {
    expect(model).toBeDefined();
    expect(service).toBeDefined();
    expect(batchService).toBeDefined();
    expect(patientService).toBeDefined();
  });
});
