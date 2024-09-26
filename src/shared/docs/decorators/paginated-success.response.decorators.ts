import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedDataResponseDto } from '../../../utils/responses/success.response';

export const ApiOkResponsePaginated = <T extends Type<unknown>>({
  type,
  description,
}: {
  type: T;
  description: string;
}) =>
  applyDecorators(
    ApiExtraModels(PaginatedDataResponseDto, type),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDataResponseDto) },
          {
            properties: {
              rows: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
              total: {
                type: 'integer',
                example: 100,
              },
              pageSize: {
                type: 'integer',
                example: 10,
              },
              page: {
                type: 'integer',
                example: 1,
              },
              nextPage: {
                type: 'integer',
                example: 2,
              },
              prevPage: {
                type: 'integer',
                example: null,
              },
              totalPages: {
                type: 'integer',
                example: 10,
              },
            },
            type: 'object',
          },
        ],
      },
    }),
  );
