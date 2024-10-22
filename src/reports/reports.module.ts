import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportModels } from './models';
import { StockAdjustmentsModule } from 'src/stock-adjustments/stock-adjustments.module';
import { DrugsModule } from 'src/inventory/drugs/drugs.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ReportModels),
    StockAdjustmentsModule,
    DrugsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
