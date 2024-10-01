import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../../../utils/responses/success.response';

export const ApiSuccessResponse = ({
  type,
  description,
  isArray = false,
}: {
  type: any;
  description: string;
  isArray?: boolean; // Optional parameter to specify if the data is an array
}) =>
  applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, type),
    ApiOkResponse({
      description,
      schema: {
        ...(isArray
          ? {
              allOf: [
                { $ref: getSchemaPath(ApiSuccessResponseDto) },
                {
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: getSchemaPath(type) },
                    },
                  },
                },
              ],
            }
          : {
              allOf: [
                { $ref: getSchemaPath(ApiSuccessResponseDto) },
                {
                  properties: {
                    data: {
                      $ref: getSchemaPath(type),
                    },
                  },
                },
              ],
            }),
      },
    }),
  );

export const ApiSuccessResponseNullData = ({
  description,
}: {
  description: string;
}) =>
  applyDecorators(
    ApiExtraModels(ApiSuccessResponseNoData),
    ApiCreatedResponse({
      description,
      schema: {
        allOf: [{ $ref: getSchemaPath(ApiSuccessResponseNoData) }],
      },
    }),
  );

export const ApiCreatedSuccessResponse = <T extends Type<unknown>>({
  type,
  description,
}: {
  type: T;
  description: string;
}) =>
  applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, type),
    ApiCreatedResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(type),
              },
            },
          },
        ],
      },
    }),
  );
