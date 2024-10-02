import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { CreateDrugDto } from './create-drug.dto';
import { IsString, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class DrugPaginationDto extends IntersectionType(PaginationRequestDto) {
  @IsUUID()
  @ApiPropertyOptional()
  supplierId: string;

  @ApiPropertyOptional()
  @IsString({ each: true })
  categories: string[];

  @IsUUID()
  @ApiPropertyOptional()
  facilityId: string;

  @IsUUID()
  @ApiPropertyOptional()
  departmentId: string;
}

export class DrugAnalytics {
  @ApiProperty({
    example: 100,
    description: 'The total number of drugs in the system',
  })
  totalDrugs: number;

  @ApiProperty({ example: 10, description: 'The number of drug requests' })
  drugRequests: number;

  @ApiProperty({
    example: 5,
    description: 'The percentage increment of drug requests',
  })
  drugIncrement: number;

  @ApiProperty({
    example: 10,
    description: 'The number of drug request increments',
  })
  requestIncrement: number;

  @ApiProperty({
    example: 20,
    description: 'The number of drugs that are out of stock',
  })
  outOfStock: number;

  @ApiProperty({
    example: 50,
    description: 'The number of drugs that are in stock',
  })
  stocked: number;

  @ApiProperty({
    example: 80,
    description: 'The number of drugs that are low in stock',
  })
  lowStocked: number;
}

export class DrugResponse extends IntersectionType(
  CreateDrugDto,
  GenericResponseDto,
) {}
