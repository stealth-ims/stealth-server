import { StockAdjustmentsModule } from 'src/stock-adjustments/stock-adjustments.module';
import { AdminModule } from '../../admin/admin.module';
import { AuthModule } from '../../auth/auth.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { NotificationModule } from '../../notification/notification.module';
import { ReportsModule } from '../../reports/reports.module';
import { UserModule } from '../../user/user.module';
import { OrdersModule } from 'src/reports/orders/orders.module';

export const IndexModules = [
  NotificationModule,
  AuthModule,
  UserModule,
  AdminModule,
  OrdersModule,
  InventoryModule,
  ReportsModule,
  StockAdjustmentsModule,
];
