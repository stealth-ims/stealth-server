import { OmitType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create.dto';
import { PaginationRequestDto } from '../../core/shared/dto/pagination.dto';

export class GetNotificationDto extends CreateNotificationDto {}

export class FetchNotificationsQueryDto extends OmitType(PaginationRequestDto, [
  'search',
]) {}
