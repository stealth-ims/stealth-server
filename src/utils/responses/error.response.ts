import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

export class ApiErrorResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
  @ApiProperty()
  statusCode: number;
}

export function throwError(logger: Logger, error: any) {
  if (error instanceof UniqueConstraintError) {
    const err = error.errors[0];
    logger.warn(`${err.value} already exists`);
    return new BadRequestException(
      `${err.path}: ${err.message}, ${err.value} already exists`,
      JSON.stringify(err),
    );
  }
  if (error instanceof ForeignKeyConstraintError) {
    return new BadRequestException((error.original as any).detail);
  }
  if (error instanceof HttpException) {
    return error;
  }
  logger.error(
    `An error occured: ${error.name} :: ${error.message}`,
    error.stack,
  );
  return new InternalServerErrorException(error.message, error);
}
