import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { CreateSupplierDto } from './create-supplier.dto';

export class GetSupplierDto extends IntersectionType(PaginationRequestDto) {}

export class SupplierResponse extends IntersectionType(
  CreateSupplierDto,
  GenericResponseDto,
) {}
