import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { OrderStatus } from 'src/shared/enums/drugOrder.enum';

export class GetOrdersDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'The status of the order',
    example: 'completed',
    enum: ['requested', 'draft', 'cancelled', 'delivering', 'received'],
    default: 'draft',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'The supplier of the order',
    example: 'Earnest Chemist Limited',
  })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'The name of the drug',
    example: 'Tramadol',
  })
  @IsString()
  @IsOptional()
  drugName?: string;
}
