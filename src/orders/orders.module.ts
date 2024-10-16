import { Module } from '@nestjs/common';
import { DrugOrdersController } from './orders.controller';
import { DrugOrdersService } from './orders.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DrugOrder } from './models/drugOrder.model';

@Module({
  imports: [SequelizeModule.forFeature([DrugOrder])],
  controllers: [DrugOrdersController],
  providers: [DrugOrdersService],
})
export class OrdersModule {}
