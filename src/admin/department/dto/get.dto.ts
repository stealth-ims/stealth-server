import { Department } from './../models/department.model';
import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class DepartmentResponse extends IntersectionType(
  Department,
  GenericResponseDto,
) {}
