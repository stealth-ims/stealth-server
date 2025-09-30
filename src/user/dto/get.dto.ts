import {
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { CreateSettingsDto, CreateUserDto } from './create.dto';
import { GetNoPaginateDto } from '../../core/shared/dto/get-no_paginate.dto';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';
import { IsOptional, IsString } from 'class-validator';

export class GetUserDto extends OmitType(CreateUserDto, [
  'deactivatedBy',
  'deletedAt',
  'deletedBy',
  'facilityId',
  'username',
]) {
  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  facility: GetNoPaginateDto;

  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  department: GetNoPaginateDto;
}

export class GetSettingsDto extends IntersectionType(
  PickType(GenericResponseDto, ['id']),
  CreateSettingsDto,
) {}

export class FindUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  // @ApiPropertyOptional({
  //   type: [String],
  //   description: 'Fields to search within',
  // })
  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
  searchFields?: string[];

  facilityId: string;

  departmentId: string;
}
export class GetUsersNoPaginateDto {
  @ApiResponseProperty({ example: '9eeb2d6d-3a0a-4201-900e-f99c902cb6f0' })
  id: string;

  @ApiResponseProperty({ example: 'Jack Frost' })
  fullName: string;

  @ApiResponseProperty({ example: 'example@gmail.com' })
  email: string;
}
