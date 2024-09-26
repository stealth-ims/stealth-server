import { ReportModels } from 'src/reports/models';
import { DrugOrderModels } from '../../orders/models';
import { InventoryModels } from 'src/inventory/models';
import { UserModels } from '../../auth/models';

export const IndexModels = [...UserModels, ...ReportModels, ...DrugOrderModels, ...InventoryModels];
