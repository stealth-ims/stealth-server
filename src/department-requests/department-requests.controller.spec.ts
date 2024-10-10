import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DepartmentRequestsController } from './department-requests.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { configuration } from 'src/shared/config/config';
import { DepartmentRequestsService } from './department-requests.service';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';
import * as request from 'supertest';
import { IndexModels } from 'src/shared/models/index.models';
import { DepartmentService } from 'src/admin/department/department.service';
import { Department } from 'src/admin/department/models/department.model';
import { FacilityService } from 'src/admin/facility/facility.service';
import { Facility } from 'src/admin/facility/models/facility.model';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';

describe('DepartmentRequestsController', () => {
  let controller: DepartmentRequestsController;
  let app: INestApplication;
  let server: ReturnType<typeof app.getHttpServer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          ...(configuration.test as SequelizeModuleOptions),
          models: IndexModels,
        }),
        SequelizeModule.forFeature(IndexModels),
      ],
      controllers: [DepartmentRequestsController],
      providers: [DepartmentRequestsService],
    }).compile();

    controller = module.get<DepartmentRequestsController>(
      DepartmentRequestsController,
    );

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Creating requests', () => {
    const facilityService = new FacilityService(Facility);
    const departmentService = new DepartmentService(Department);

    const query = new PaginationRequestDto();

    let departmentId: string;
    let payload: Partial<CreateDepartmentRequestDto>;

    beforeAll(async () => {
      const facilities = await facilityService.findAll(query);

      const facilityId = facilities.rows[0].id;

      const departments = await departmentService.findAll(query, facilityId);

      departmentId = departments.rows[0].id;

      payload = {
        departmentId,
        drugId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        quantity: 4,
        additionalNotes: 'The recent drugs had expired',
      };
    });

    it('should create successfully', async () => {
      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(201);

      expect(response.body.data).toBeDefined();
    });

    it('should fail for missing department', async () => {
      const response = await request(server)
        .post('/department-requests')
        .send({
          ...payload,
          departmentId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        });

      expect(response.statusCode).toBe(404);
    });

    // TODO: Implement when drugs are implemented
    // it('should fail for missing drug', async () => {
    //   const response = await request(server)
    //     .post('/department-requests')
    //     .send(payload);
    //
    //   expect(response.statusCode).toBe(404);
    // });

    it('should spit out 400', async () => {
      delete payload.departmentId;

      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(400);
    });
  });
});
