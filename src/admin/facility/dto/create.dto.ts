import { PickType } from '@nestjs/swagger';
import { Facility } from '../models/facility.model';

export class CreateFacilityDto extends PickType(Facility, [
  'name',
  'password',
]) {
  email: string;
}
