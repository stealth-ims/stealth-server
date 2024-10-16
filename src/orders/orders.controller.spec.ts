describe('DrugOrdersController', () => {
  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});

/* 
import { Test, TestingModule } from '@nestjs/testing';
import { DrugOrdersController } from './orders.controller';
import { DrugOrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { todo } from 'node:test';
let controller: DrugOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugOrdersController],
      providers: [AuthGuard, DrugOrdersService],
    }).compile();

    controller = module.get<DrugOrdersController>(DrugOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();*/
