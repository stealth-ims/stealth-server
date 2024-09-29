import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { INestApplication } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ReportModels } from './models';
import { configuration } from 'src/shared/config/config';
import * as request from 'supertest';
import { CreateReportDto } from './dto/create.dto';
import 'dotenv/config';

describe('ReportsController', () => {
  let controller: ReportsController;
  let app: INestApplication;
  let server: ReturnType<typeof app.getHttpServer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          ...(configuration.test as SequelizeModuleOptions),
          models: [...ReportModels],
        }),
        SequelizeModule.forFeature(ReportModels),
      ],
      controllers: [ReportsController],
      providers: [ReportsService],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);

    app = module.createNestApplication();

    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Creating reports', () => {
    it('should create successfully', async () => {
      const payload: CreateReportDto = {
        endDate: new Date(),
        startDate: new Date(),
        nameInExport: '2024-report',
        reportName: 'Sales report',
        reportLayout: 'PORTRAIT',
      };

      const response = await request(server).post('/reports').send(payload);

      expect(response.statusCode).toBe(201);

      expect(response.body.data).toBeDefined();
    });

    it('should spit out 400', async () => {
      const payload: Omit<CreateReportDto, 'nameInExport'> = {
        endDate: new Date(),
        startDate: new Date(),
        reportName: 'Sales report',
        reportLayout: 'PORTRAIT',
      };

      const response = await request(server).post('/reports').send(payload);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('getting reports', () => {
    it('should fetch successfully', async () => {
      const response = await request(server).get('/reports');

      expect(response.statusCode).toBe(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('getting single report', () => {
    it('should fetch successfully', async () => {
      const response = await request(server).get('/reports/the-akshual-id');

      expect(response.statusCode).toBe(200);

      expect(response.body.data).toBeDefined();

      for (const key of [
        'endDate',
        'startDate',
        'nameInExport',
        'reportName',
        'reportLayout',
      ]) {
        expect(response.body.data).toHaveProperty(key);
        expect(response.body.data[key]).toBeDefined();
      }
    });

    it('should return four oh four', async () => {
      const response = await request(server).get('/reports/404');

      expect(response.statusCode).toBe(404);

      expect(response.body.data).toBeNull();
    });
  });

  describe('deleting single report', () => {
    it('should delete successfully', async () => {
      const response = await request(server).delete('/reports/the-akshual-id');

      expect(response.statusCode).toBe(200);

      expect(response.body.data).toBeNull();
    });

    it('should return four oh four', async () => {
      const response = await request(server).delete('/reports/404');

      expect(response.statusCode).toBe(404);

      expect(response.body.data).toBeNull();
    });
  });
});
