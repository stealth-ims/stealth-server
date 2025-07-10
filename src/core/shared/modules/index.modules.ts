import { DepartmentRequestsModule } from 'src/department-requests/department-requests.module';
import { AdminModule } from '../../../admin/admin.module';
import { AuthModule } from '../../../auth/auth.module';
import { CloudinaryModule } from '../../../cloudinary/cloudinary.module';
import { InventoryModule } from '../../../inventory/inventory.module';
import { NotificationModule } from '../../../notification/notification.module';
import { ReportsModule } from '../../../reports/reports.module';
import { UserModule } from '../../../user/user.module';
import { SalesModule } from 'src/sales/sales.module';
import { OrdersModule } from '../../../orders/orders.module';
import { PatientModule } from '../../../patient/patient.module';
import { ComplaintsModule } from '../../../complaints/complaints.module';
import { DashboardModule } from '../../../dashboard/dashboard.module';
import { ImsStockmateModule } from '../../../ims-stockmate/ims-stockmate.module';
import { SyncModule } from '../../../sync/sync.module';
import { AuditsModule } from '../../../audit/audit.module';
import { ExportsModule } from '../../../exports/exports.module';
import { HealthModule } from '../../../health/health.module';

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
  SalesModule,
  PatientModule,
  ComplaintsModule,
  DashboardModule,
  ImsStockmateModule,
  HealthModule,
  AuditsModule,
  ExportsModule,
  SyncModule,
];
