import { ReportModels } from 'src/reports/models';
import { InventoryModels } from 'src/inventory/models';
import { UserModels } from '../../auth/models';
import { AdminModels } from '../../admin/models';
import { DepartmentRequestModels } from '../../department-requests/models';
import { DrugOrderModels } from 'src/reports/orders/models';
import { StockAdjustment } from 'src/stock-adjustments/model';
import { SalesModels } from 'src/sales/models';

export const IndexModels = [
  ...AdminModels,
  ...UserModels,
  ...ReportModels,
  ...DrugOrderModels,
  ...InventoryModels,
  ...DepartmentRequestModels,
  ...SalesModels,
  StockAdjustment,
];
