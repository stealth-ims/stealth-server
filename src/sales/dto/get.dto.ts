import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { CreateSaleDto } from './create.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus, PaymentStatusType } from '../models/sales.models';

export class GetSalesDto extends CreateSaleDto {}

export class GetSalesPaginationDto extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatusType;
}
