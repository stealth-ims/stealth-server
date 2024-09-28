import { IntersectionType } from '@nestjs/swagger';
import { CreateDrugDto } from 'src/inventory/drugs/dto';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';

export class GetSupplierDto extends IntersectionType(PaginationRequestDto) {}

export class SupplierResponse extends IntersectionType(
  CreateDrugDto,
  GenericResponseDto,
) {}
