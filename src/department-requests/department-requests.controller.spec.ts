import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DepartmentRequestsController } from './department-requests.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { configuration } from 'src/shared/config/config';
import { DepartmentRequestsService } from './department-requests.service';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';
import * as request from 'supertest';
import { IndexModels } from 'src/shared/models/index.models';

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
    it('should create successfully', async () => {
      const payload: CreateDepartmentRequestDto = {
        drugId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        departmentId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        quantity: 4,
        additionalNotes: 'The recent drugs had expired',
      };

      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(201);

      expect(response.body.data).toBeDefined();
    });

    it('should fail for missing department', async () => {
      const payload: CreateDepartmentRequestDto = {
        drugId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        departmentId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        quantity: 4,
        additionalNotes: 'The recent drugs had expired',
      };

      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(404);
    });

    it('should fail for missing drug', async () => {
      const payload: CreateDepartmentRequestDto = {
        drugId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        departmentId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        quantity: 4,
        additionalNotes: 'The recent drugs had expired',
      };

      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(404);
    });

    it('should spit out 400', async () => {
      const payload: Omit<CreateDepartmentRequestDto, 'drugId'> = {
        departmentId: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
        quantity: 4,
        additionalNotes: 'The recent drugs had expired',
      };

      const response = await request(server)
        .post('/department-requests')
        .send(payload);

      expect(response.statusCode).toBe(400);
    });
  });
});
