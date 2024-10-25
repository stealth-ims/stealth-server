import { Module } from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { StockAdjustmentsController } from './stock-adjustments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { StockAdjustment } from './model';
import { DrugsModule } from 'src/inventory/drugs/drugs.module';

@Module({
  imports: [DrugsModule, SequelizeModule.forFeature([StockAdjustment])],
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService],
  exports: [StockAdjustmentsService],
})
export class StockAdjustmentsModule {}
