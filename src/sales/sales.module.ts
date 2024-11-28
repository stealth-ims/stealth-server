import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesModels } from './models';
import { ItemsModule } from '../inventory/items/items.module';

@Module({
  imports: [SequelizeModule.forFeature(SalesModels), ItemsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
