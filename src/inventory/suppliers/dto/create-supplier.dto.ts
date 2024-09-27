import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class CreateSupplierDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({ example: 'Lighthouse ltd', description: 'name of supplier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of person to contact',
  })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({
    example: 'Sales Manager',
    description: 'Position of contact person',
  })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    example: '0592785415',
    description: 'phone number of person to contact',
  })
  @IsString()
  @MinLength(10)
  contact: string;

  @ApiProperty({ example: 'Pharmaceuticals', description: 'Type of supplier' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Additional info of supplier' })
  @IsString()
  info: string;
}
