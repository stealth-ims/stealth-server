import { Module } from '@nestjs/common';
import { SmsModule } from '../../notification/sms/sms.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { NotificationModule } from '../../notification/notification.module';
import { PatientModule } from '../../patient/patient.module';
import { SalesModule } from '../../sales/sales.module';
import { UserModule } from '../../user/user.module';
import { StockmateSmsController } from './sms.controller';
import { StockmateSmsService } from './sms.service';
import { ImsStockQlService } from './ims-stockql.service';

@Module({
  imports: [
    SmsModule,
    InventoryModule,
    UserModule,
    SalesModule,
    PatientModule,
    NotificationModule,
  ],
  controllers: [StockmateSmsController],
  providers: [StockmateSmsService, ImsStockQlService],
})
export class StockmateSmsModule {}
