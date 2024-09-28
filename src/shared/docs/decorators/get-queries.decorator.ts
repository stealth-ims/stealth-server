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

export type QueryParams = 'search' | 'limit' | 'page';

export const QueryDocs = (params: QueryParams[]) => {
  // apply ApiQuery decorator according to fields in DTO
  const docs = [];
  params.forEach((param) => {
    switch (param) {
      case 'search':
        docs.push(
          ApiQuery({
            name: 'search',
            type: String,
            required: false,
            description: 'what to search for',
          }),
        );
        break;
      case 'limit':
        docs.push(
          ApiQuery({
            name: 'limit',
            type: Number,
            required: false,
            description: 'The maximum number of rows to retrieve',
          }),
        );
        break;
      case 'page':
        docs.push(
          ApiQuery({
            name: 'page',
            type: Number,
            required: false,
            description: 'The page number',
          }),
        );
        break;
    }
  });
  return applyDecorators(...docs);
};
