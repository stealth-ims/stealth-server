import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['fullName']),
) {
  @ApiProperty({
    example: '0244335567',
    description: 'The phone number of the user',
  })
  @IsNotEmpty()
  phoneNumber: string;
}
