import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
