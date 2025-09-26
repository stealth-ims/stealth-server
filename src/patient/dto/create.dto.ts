import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';
import { IsNotEmpty, IsOptional, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';
import { format } from 'date-fns';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Paul Billings',
    description: 'Name of the patient',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'gh-56387082875',
    description: 'Primary Identification number of patient',
  })
  @IsNotEmpty()
  cardIdentificationNumber: string;

  @ApiPropertyOptional({
    example: '45876378475',
    description: 'Secondary Identification number of patient',
  })
  @IsOptional()
  secondaryIdentificationNumber: string;

  @ApiProperty({
    example: format(new Date(), 'yyyy-MM-dd'),
    description: 'Date of birth of the patient',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @MaxDate(new Date())
  dateOfBirth: Date;
}

export class CreatePatientResponseDto extends IntersectionType(
  CreatePatientDto,
  GenericResponseDto,
) {
  @ApiResponseProperty({
    example: null,
  })
  deletedAt: Date;

  @ApiResponseProperty({
    example: null,
  })
  deletedBy: string;
}
