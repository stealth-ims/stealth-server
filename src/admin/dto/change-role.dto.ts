import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ChangeRoleDto {
  @ApiPropertyOptional({
    example: 'Healthcare Worker',
    description: 'changing user role to something else',
  })
  @IsOptional()
  @IsString()
  role: string;

  @ApiPropertyOptional({
    example: [
      'items:READ',
      'item_categories:READ_WRITE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
    ],
    description: 'The permissions assigned to a user',
  })
  @IsOptional()
  @IsArray()
  permissions: string[];
}
