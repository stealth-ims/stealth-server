import { ReportModels } from 'src/reports/models';
import { InventoryModels } from 'src/inventory/models';
import { UserModels } from '../../auth/models';
import { AdminModels } from '../../admin/models';
import { DrugOrderModels } from 'src/reports/orders/models';
import { StockAdjustment } from 'src/stock-adjustments/model';

export const IndexModels = [
  ...AdminModels,
  ...UserModels,
  ...ReportModels,
  ...DrugOrderModels,
  ...InventoryModels,
  StockAdjustment,
];
