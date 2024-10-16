import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/interface/roles.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    example: 'healthcare_worker',
    enum: Role,
    description: 'changing user role to something else',
  })
  @IsNotEmpty()
  @IsString()
  role: string;
}
