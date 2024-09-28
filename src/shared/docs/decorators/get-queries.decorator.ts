import {
  applyDecorators,
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request } from 'express';

export const GetQueries = createParamDecorator(
  async (data: ClassConstructor<any>, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const query = request.query;

    // Transform query into DTO instance
    const instance = plainToInstance(data, query);

    const errors = await validate(instance);

    if (errors.length > 0) {
      throw new BadRequestException(`Validation failed: ${errors[0]}`);
    }

    return instance;
  },
);

export const PaginationDocs = () => {
  // apply ApiQuery decorator according to fields in DTO
  return applyDecorators(
    ApiQuery({
      name: 'search',
      type: String,
      required: false,
      description: 'what to search for',
    }),
    ApiQuery({
      name: 'pageSize',
      type: Number,
      required: false,
      description: 'The maximum number of rows to retrieve',
    }),
    ApiQuery({
      name: 'page',
      type: Number,
      required: false,
      description: 'The page number to retrieve',
    }),
    ApiQuery({
      name: 'orderBy',
      type: String,
      required: false,
      description: 'The field to order by',
    }),
  );
};
