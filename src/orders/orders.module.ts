import { Module } from '@nestjs/common';
import { DrugOrdersController } from './orders.controller';
import { DrugOrdersService } from './orders.service';

@Module({
  controllers: [DrugOrdersController],
  providers: [DrugOrdersService],
})
export class OrdersModule {}
