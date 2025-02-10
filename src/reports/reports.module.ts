import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportModels } from './models';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ReportModels),
    InventoryModule,
    SalesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
