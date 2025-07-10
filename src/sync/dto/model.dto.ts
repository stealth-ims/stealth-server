import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IncomingHttpHeaders } from 'http';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';

export enum RequestMethods {
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
export class SyncDto extends GenericResponseDto {
  @ApiProperty({
    example: 'POST',
    enum: RequestMethods,
    description: 'The request method',
  })
  @IsNotEmpty()
  @IsEnum(RequestMethods)
  method: RequestMethods;

  @ApiProperty({
    example: '/api/user/create',
    description: 'The request url',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    example: { name: 'John Doe' },
    description: 'The request body (optional)',
  })
  @IsOptional()
  @IsObject()
  body?: Record<string, any>;

  @ApiProperty({
    example: { authorization: 'Bearer xyz' },
    description: 'The request headers',
  })
  @IsNotEmpty()
  @IsObject()
  headers: IncomingHttpHeaders;

  @ApiResponseProperty({
    example: 'UPDATE',
  })
  action: string;

  @ApiResponseProperty({
    example: 'User not found',
  })
  message: string;

  @ApiResponseProperty({
    example: 404,
  })
  statusCode: number;

  @ApiResponseProperty({
    example: '938409e3-f01f-4e25-b6a8-11abc823f4c4',
  })
  departmentId?: string;

  @ApiResponseProperty({
    example: '44072b38-f12a-4b76-b40d-fdfeb9d7a3b2',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: '70b3bab4-9756-4181-a660-f8957d7d116f',
  })
  createdById: string;
}
