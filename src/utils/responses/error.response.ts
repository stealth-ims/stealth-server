import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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

export const  throwError = (logger: Logger, error: any) : Error => {
  logger.error(error);
    if (error instanceof NotFoundException) {
      return error;
    }
    if (error instanceof UniqueConstraintError) {
      let err = error.errors[0];
      logger.warn(`${err.value} already exists`)
      return new BadRequestException(`${err.path}: ${err.message}, ${err.value} already exists`, JSON.stringify(err))
    }
    return new InternalServerErrorException(error.message, error);
}