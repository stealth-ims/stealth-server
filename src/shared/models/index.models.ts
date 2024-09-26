import { ReportModels } from 'src/reports/models';
import { InventoryModels } from 'src/inventory/models';
import { UserModels } from '../../user/models';

export const IndexModels = [...UserModels, ...ReportModels, ...InventoryModels];
