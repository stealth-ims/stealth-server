import { ApiProperty, ApiQuery, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { DrugsCategory, DrugsCategoryStatus } from '../models/drugs.category.model';
import { FindOptions, Order, WhereOptions } from 'sequelize';

export class CreateDrugsCategoryDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: "laxatives",
    description: "drug category name"
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class DrugsCategoryResponse extends IntersectionType(DrugsCategory, GenericResponseDto) { }

export class GetDrugsCategoryDto {
  @ApiProperty({example: 10, description: "Number of drug categories to fetch", required: false})
  limit?: number; 

  @ApiProperty({example:"name"})
  order?: Order;

  where?: WhereOptions<DrugsCategory>;
}