import { IsNumber, IsString } from 'class-validator';

export class PaginationRequestDto {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  page: number;

  @IsString({ each: true })
  search: string;

  @IsString()
  orderBy: string;
}
