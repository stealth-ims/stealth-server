import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import TestAgent from 'supertest/lib/agent';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let agent: TestAgent;
  // let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    sequelize = moduleFixture.get<Sequelize>(Sequelize);

    await app.init();
    agent = request(app.getHttpServer());
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return agent.get('/').expect(404);
  });
});
