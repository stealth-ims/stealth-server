import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) { }
