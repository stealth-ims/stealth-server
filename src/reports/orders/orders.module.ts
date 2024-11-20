import { Module } from '@nestjs/common';
import { ItemOrdersController } from './orders.controller';
import { ItemOrdersService } from './orders.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemOrder } from './models/itemOrder.model';

@Module({
  imports: [SequelizeModule.forFeature([ItemOrder])],
  controllers: [ItemOrdersController],
  providers: [ItemOrdersService],
})
export class OrdersModule {}
