import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class CreateDrugsCategoryDto extends IntersectionType(
  GenericResponseDto,
) {
  @ApiProperty({
    example: 'laxatives',
    description: 'drug category name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
