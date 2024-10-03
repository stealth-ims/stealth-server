import { Module } from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { StockAdjustmentsController } from './stock-adjustments.controller';
import { RequestsModule } from './requests/requests.module';

@Module({
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService],
  imports: [RequestsModule],
})
export class StockAdjustmentsModule {}
