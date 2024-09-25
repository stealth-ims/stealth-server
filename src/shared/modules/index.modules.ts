import { AdminModule } from '../../admin/admin.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { OrdersModule } from '../../orders/orders.module';
import { ReportsModule } from '../../reports/reports.module';
import { UserModule } from '../../user/user.module';

export const IndexModules = [
  UserModule,
  AdminModule,
  OrdersModule,
  InventoryModule,
  ReportsModule,
];
