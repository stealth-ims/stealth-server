import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiProperty({
    example: "af7c1fe6-d669-414e-b066-e9733f0de7a8",
    description: 'The id of the drug',
  })
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
