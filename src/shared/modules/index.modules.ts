import { AdminModule } from '../../admin/admin.module';
import { AuthModule } from '../../auth/auth.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { NotificationModule } from '../../notification/notification.module';
import { OrdersModule } from '../../orders/orders.module';
import { ReportsModule } from '../../reports/reports.module';
import { UserModule } from '../../user/user.module';

export const IndexModules = [
  NotificationModule,
  AuthModule,
  UserModule,
  AdminModule,
  OrdersModule,
  InventoryModule,
  ReportsModule,
];
