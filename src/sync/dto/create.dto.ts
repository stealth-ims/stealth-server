import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { RequestMethods, SyncDto } from './model.dto';

export class SyncBodyDto extends SyncDto {}

export class CreateSyncDto {
  @ApiProperty({
    type: [SyncBodyDto],
    description: 'The queued requests',
  })
  @IsNotEmpty()
  @IsArray()
  data: SyncBodyDto[];
}

export const RequestMethodActionMap: Record<RequestMethods, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};
