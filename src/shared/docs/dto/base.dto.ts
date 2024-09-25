import { ApiResponseProperty } from '@nestjs/swagger';

export class GenericResponseDto {
  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  id: string;

  @ApiResponseProperty({
    example: new Date(),
  })
  createdAt: Date;

  @ApiResponseProperty({
    example: new Date(),
  })
  updatedAt: Date;
}

// @ApiResponseProperty({
//   example: null,
// })
// deletedAt: Date;

// @ApiResponseProperty({
//   example: null,
// })
// deletedBy: string;
