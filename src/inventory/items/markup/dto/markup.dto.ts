import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { GenericResponseDto } from '../../../../core/shared/dto/base.dto';
export enum MarkupType {
  NHIS = 'NHIS',
}
export enum AmountType {
  PERCENTAGE = 'percentage',
  PRICE = 'price',
}
export class MarkupDto extends GenericResponseDto {
  @ApiProperty({
    example: 'NHIS',
    description: 'The type of markup',
    enum: MarkupType,
  })
  @IsNotEmpty()
  @IsEnum(MarkupType)
  type: MarkupType;

  @ApiProperty({
    example: 'percentage',
    description: 'The type of amount',
    enum: AmountType,
  })
  @IsNotEmpty()
  @IsEnum(AmountType)
  amountType: AmountType;

  @ApiProperty({
    example: 10,
    description: 'The markup amount (numeric value)',
  })
  @IsNumber()
  amount: number;

  @ApiResponseProperty({
    example: '98b2c442-6935-45d7-a0bb-a8add269b1f1',
  })
  batchId: string;

  @ApiResponseProperty({
    example: 'db527030-8d20-4a72-a103-2870294563ad',
  })
  itemId: string;

  @ApiResponseProperty({
    example: '9ac7594b-fbbc-48ec-91d4-e2f865f74423',
  })
  createdById: string;

  @ApiResponseProperty({
    example: 'e90cc676-fee0-4441-b27a-c475647ff4d5',
  })
  departmentId: string;

  @ApiResponseProperty({
    example: '8195dd04-6e29-4f8f-b84f-3c3edb619982',
  })
  facilityId: string;
}
