import {
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UniqueConstraintError } from 'sequelize';

export class ApiErrorResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
  @ApiProperty()
  statusCode: number;
}

export const throwError = (logger: Logger, error: any): Error => {
  // add more instances
  logger.error(error);
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException
  ) {
    return error;
  }
  if (error instanceof UniqueConstraintError) {
    const err = error.errors[0];
    logger.warn(`${err.value} already exists`);
    return new ConflictException(
      `field ${err.path}: ${err.message}, ${err.value} already exists`,
      err.type,
    );
  }
  return new InternalServerErrorException(error.message, error);
};
