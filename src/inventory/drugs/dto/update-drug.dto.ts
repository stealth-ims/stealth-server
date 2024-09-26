import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDrugDto } from './create-drug.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateDrugDto extends PartialType(CreateDrugDto) {}
