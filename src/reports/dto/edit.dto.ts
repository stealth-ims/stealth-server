import { PartialType } from '@nestjs/swagger';
import { CreateReportDto } from './create.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {}
