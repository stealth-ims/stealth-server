import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportModels } from './models';
import { StockAdjustmentsModule } from 'src/stock-adjustments/stock-adjustments.module';
import { ItemsModule } from 'src/inventory/items/items.module';

@Module({
  imports: [
    SequelizeModule.forFeature(ReportModels),
    StockAdjustmentsModule,
    ItemsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
