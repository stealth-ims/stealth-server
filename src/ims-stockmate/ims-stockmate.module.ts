import { Module } from '@nestjs/common';
import { ImsStockmateService } from './ims-stockmate.service';
import { ImsStockmateController } from './ims-stockmate.controller';
import { SmsModule } from '../notification/sms/sms.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UserModule } from '../user/user.module';
import { ImsStockQlService } from './ims-stockql.service';

@Module({
  imports: [SmsModule, InventoryModule, UserModule],
  controllers: [ImsStockmateController],
  providers: [ImsStockmateService, ImsStockQlService],
})
export class ImsStockmateModule {}
