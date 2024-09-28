import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class PaginationRequestDto {
  @ApiProperty({
    example: 10,
    description: 'The number of items to return',
    required: false,
  })
  @IsNumber()
  pageSize: number;

  @ApiProperty({
    example: 1,
    description: 'The page number to return',
    required: false,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    example: 'name',
    description: 'The field to search by',
    isArray: true,
    required: false,
  })
  @IsString({ each: true })
  search: string;

  @ApiProperty({
    example: 'name',
    description: 'The field to sort by',
    required: false,
  })
  @IsString()
  orderBy: string;
}
