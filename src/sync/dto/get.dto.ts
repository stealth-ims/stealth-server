import { OmitType, PickType } from '@nestjs/swagger';
import { SyncDto } from './model.dto';
import { PaginationRequestDto } from '../../core/shared/dto/pagination.dto';

export class FindSyncRequestsQueryDto extends PaginationRequestDto {}

export class GetSyncRequestsDto extends PickType(SyncDto, [
  'id',
  'method',
  'url',
  'action',
  'message',
  'statusCode',
  'createdAt',
]) {}

export class GetSyncRequestDto extends OmitType(SyncDto, [
  'departmentId',
  'facilityId',
  'createdById',
  'updatedAt',
]) {}
