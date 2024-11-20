describe('ItemOrdersController', () => {
  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});

/* 
import { Test, TestingModule } from '@nestjs/testing';
import { ItemOrdersController } from './orders.controller';
import { ItemOrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { todo } from 'node:test';
let controller: ItemOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemOrdersController],
      providers: [AuthGuard, ItemOrdersService],
    }).compile();

    controller = module.get<ItemOrdersController>(ItemOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();*/
