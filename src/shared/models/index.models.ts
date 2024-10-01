import { ReportModels } from 'src/reports/models';
import { InventoryModels } from 'src/inventory/models';
import { DrugOrderModels } from '../../orders/models';
import { UserModels } from '../../auth/models';
import { AdminModels } from '../../admin/models';

export const IndexModels = [
  ...AdminModels,
  ...UserModels,
  ...ReportModels,
  ...DrugOrderModels,
  ...InventoryModels,
];
