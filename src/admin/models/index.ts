import { DepartmentModels } from '../department/models';
import { FacilityModels } from '../facility/models';

export const AdminModels = [...DepartmentModels, ...FacilityModels];
