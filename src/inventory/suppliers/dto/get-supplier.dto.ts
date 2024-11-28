import { IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { CreateSupplierDto } from './create-supplier.dto';

export class GetSupplierDto extends IntersectionType(PaginationRequestDto) {}

export class SupplierResponse extends IntersectionType(
  CreateSupplierDto,
  GenericResponseDto,
) {}

export class CreateSupplierResponse extends IntersectionType(
  OmitType(CreateSupplierDto, ['status', 'city']),
  GenericResponseDto,
) {}

export class GetSuppliersResponse extends PickType(SupplierResponse, [
  'id',
  'name',
  'createdAt',
  'phoneNumber',
  'status',
  'city',
  'physicalAddress',
]) {}
export class GetSupplierResponse extends PickType(SupplierResponse, [
  'id',
  'name',
  'primaryContactName',
  'jobTitle',
  'phoneNumber',
  'supplierType',
  'minimumOrderQuantity',
  'leadTime',
  'emergencyContactName',
  'emergencyContactTitle',
  'emergencyContactNumber',
  'physicalAddress',
  'city',
]) {}
