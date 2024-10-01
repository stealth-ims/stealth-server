import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
  @ApiProperty()
  statusCode: number;
}

export function throwError(logger, error) {
  if (error instanceof HttpException) {
    throw error;
  } else {
    logger.error(
      `An error occured: ${error.name} :: ${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException(error.message, error);
  }
}
