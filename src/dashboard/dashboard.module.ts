import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sale } from 'src/sales/models/sales.model';
import { Batch } from 'src/inventory/items/models';

@Module({
  imports: [SequelizeModule.forFeature([Sale, Batch])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
