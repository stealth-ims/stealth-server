import { PickType } from '@nestjs/swagger';
import { Department } from '../models/department.model';

export class CreateDepartmentDto extends PickType(Department, [
  'name',
  'facilityId',
]) {}
