import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';
import { IsNotEmpty, IsOptional, IsUUID, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';
import { format } from 'date-fns';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Paul Billings',
    description: 'Name of the patient',
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'gh-56387082875',
    description: 'Primary Identification number of patient',
  })
  @IsOptional()
  cardIdentificationNumber: string;

  @ApiPropertyOptional({
    example: 'f59b8418-ace4-4488-bf74-441ba47aa150',
    description: "The patient's queue unique id",
  })
  @IsOptional()
  @IsUUID(4)
  queueUniqueId: string;

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
  @MaxDate(new Date(Date.now()))
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
