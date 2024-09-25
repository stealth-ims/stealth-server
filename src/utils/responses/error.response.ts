import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
  @ApiProperty()
  statusCode: number;
}
