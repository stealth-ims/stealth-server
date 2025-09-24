import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['fullName']),
) {
  @ApiPropertyOptional({
    example: '0244335567',
    description: 'The phone number of the user',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}
