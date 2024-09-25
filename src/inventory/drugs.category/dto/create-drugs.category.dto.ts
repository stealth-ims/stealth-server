import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { DrugsCategoryStatus } from '../models/drugs.category.model';

export class CreateDrugsCategoryDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: "laxatives",
    description: "drug category name"
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}