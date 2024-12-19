import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import {
  DepartmentRequestStatus,
  DepartmentRequestStatusType,
} from '../models/department-requests.model';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class GetDepartmentRequestDto extends GenericResponseDto {
  @ApiProperty({
    example: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
    description: 'The Id of the selected item',
  })
  @IsUUID(4)
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    example: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
    description: 'The Id of the selected department',
  })
  @IsUUID(4)
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    example: '4',
    description: 'The quantity of the selected item',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 'The recent items had expired',
    description: 'The additional notes for the request',
  })
  @IsNotEmpty()
  additionalNotes: string;

  @ApiResponseProperty({
    example: `R-${new Date().getTime()}`,
  })
  requestNumber: string;

  @ApiResponseProperty({
    example: 'PENDING',
    enum: DepartmentRequestStatus,
  })
  status: DepartmentRequestStatusType;
}

export class GetItemRequestsResponseDto extends PickType(
  GetDepartmentRequestDto,
  ['id', 'requestNumber', 'quantity', 'status'],
) {
  @ApiResponseProperty({
    example: 'Some Name',
  })
  itemName: string;

  @ApiResponseProperty({
    example: new Date(),
  })
  dateRequested: Date;
}

export class GetDepartmentRequestResponseDto extends GetItemRequestsResponseDto {
  @ApiResponseProperty({
    example: 'Some Department',
  })
  departmentName: string;
}

export class GetItemRequestResponseDto extends PickType(
  GetDepartmentRequestDto,
  ['id', 'quantity', 'additionalNotes'],
) {
  @ApiResponseProperty({
    example: {
      id: '083587af-d4e4-4f25-a1d7-1a1b97f80d4d',
      name: 'Analgesics Item 2',
    },
  })
  item: object;
}
export class GetDepartmentRequestsPaginationDto extends OmitType(
  PaginationRequestDto,
  ['search'],
) {
  @ApiPropertyOptional({
    description: 'The request number',
    example: 'Req-35245284524',
  })
  @IsOptional()
  requestNumber: string;

  @ApiPropertyOptional({
    description: 'The status of the request',
    example: 'PENDING',
    enum: DepartmentRequestStatus,
  })
  @IsOptional()
  status: DepartmentRequestStatusType;
}
