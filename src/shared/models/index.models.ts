import { ReportModels } from 'src/reports/models';
import { UserModels } from '../../user/models';

export const IndexModels = [...UserModels, ...ReportModels];
