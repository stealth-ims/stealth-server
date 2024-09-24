import { AdminModule } from '../../admin/admin.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { OrdersModule } from '../../orders/orders.module';
import { ReportsModule } from '../../reports/reports.module';

export const IndexModules = [
  AdminModule,
  OrdersModule,
  InventoryModule,
  ReportsModule,
];
