import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { Department } from '../models/department.model';

export class DepartmentResponse extends IntersectionType(
  Department,
  GenericResponseDto,
) {}
