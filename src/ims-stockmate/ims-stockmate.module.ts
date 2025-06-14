import { Module } from '@nestjs/common';
import { ImsStockmateService } from './ims-stockmate.service';
import { ImsStockmateController } from './ims-stockmate.controller';
import { SmsModule } from '../notification/sms/sms.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UserModule } from '../user/user.module';
import { ImsStockQlService } from './ims-stockql.service';
import { SalesModule } from '../sales/sales.module';
import { PatientModule } from '../patient/patient.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SmsModule,
    InventoryModule,
    UserModule,
    SalesModule,
    PatientModule,
    NotificationModule,
  ],
  controllers: [ImsStockmateController],
  providers: [ImsStockmateService, ImsStockQlService],
})
export class ImsStockmateModule {}
