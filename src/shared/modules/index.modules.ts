import { DepartmentRequestsModule } from 'src/department-requests/department-requests.module';
import { StockAdjustmentsModule } from 'src/stock-adjustments/stock-adjustments.module';
import { AdminModule } from '../../admin/admin.module';
import { AuthModule } from '../../auth/auth.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { InventoryModule } from '../../inventory/inventory.module';
import { NotificationModule } from '../../notification/notification.module';
import { ReportsModule } from '../../reports/reports.module';
import { UserModule } from '../../user/user.module';
import { OrdersModule } from 'src/reports/orders/orders.module';
import { SalesModule } from 'src/sales/sales.module';

export const IndexModules = [
  NotificationModule,
  CloudinaryModule,
  AuthModule,
  UserModule,
  AdminModule,
  OrdersModule,
  InventoryModule,
  ReportsModule,
  DepartmentRequestsModule,
  StockAdjustmentsModule,
  SalesModule,
];
