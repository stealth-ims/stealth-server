import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateDepartmentRequestDto {
  @ApiProperty({
    example: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
    description: 'The Id of the selected drug',
  })
  @IsUUID(4)
  @IsNotEmpty()
  drugId: string;

  @ApiProperty({
    example: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
    description: 'The Id of the selected category',
  })
  @IsUUID(4)
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    example: '4',
    description: 'The quantity of the selected drug',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 'The recent drugs had expired',
    description: 'The additional notes for the request',
  })
  @IsNotEmpty()
  additionalNotes: string;
}
