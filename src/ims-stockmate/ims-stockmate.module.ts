import { Module } from '@nestjs/common';
import { StockmateSmsModule } from './sms/sms.module';
import { StockmateUssdModule } from './ussd/ussd.module';

@Module({
  imports: [StockmateSmsModule, StockmateUssdModule],
})
export class ImsStockmateModule {}
