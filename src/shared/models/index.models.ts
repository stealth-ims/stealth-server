import { ReportModels } from 'src/reports/models';
import { InventoryModels } from 'src/inventory/models';
import { UserModels } from '../../auth/models';
import { AdminModels } from '../../admin/models';
import { DepartmentRequestModels } from '../../department-requests/models';
import { SalesModels } from 'src/sales/models';
import { ItemOrderModels } from '../../orders/models';
import { PatientModels } from '../../patient/models';
import { NotificationModels } from '../../notification/models';
import { UserSecondaryModels } from '../../user/models';

export const IndexModels = [
  ...AdminModels,
  ...UserModels,
  ...ReportModels,
  ...ItemOrderModels,
  ...InventoryModels,
  ...DepartmentRequestModels,
  ...SalesModels,
  ...PatientModels,
  ...NotificationModels,
  ...UserSecondaryModels,
];
