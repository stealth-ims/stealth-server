import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto<T> {
  constructor(data: T, statusCode: number, message: string) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
  }
  @ApiProperty({})
  data?: T;
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
}

export class ApiSuccessResponseNoData {
  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
}

export class PaginatedDataResponseDto<T> {
  constructor(rows: T, page: number, pageSize: number, total: number) {
    const totalNumberOfPages = Math.ceil(total / pageSize);
    this.rows = rows;
    this.total = total;
    this.pageSize = pageSize;
    this.page = page;
    this.nextPage = page < totalNumberOfPages ? page + 1 : null;
    this.prevPage = page > 1 ? page - 1 : null;
    this.totalPages = totalNumberOfPages;
  }
  @ApiProperty()
  rows: T;

  @ApiProperty()
  total: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  nextPage: number | null;

  @ApiProperty()
  prevPage: number | null;

  @ApiProperty()
  totalPages: number;
}
