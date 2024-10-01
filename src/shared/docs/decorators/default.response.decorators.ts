import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import {
  ApiCreatedSuccessResponse,
  ApiSuccessResponse,
  ApiSuccessResponseNullData,
} from './response.decorators';
import { ApiOkResponsePaginated } from './paginated-success.response.decorators';

export function CustomApiResponse(
  responseTypes: CustomResponses[],
  options: { type: any; message?: string; isArray?: boolean },
) {
  return applyDecorators(
    ...responseTypes.map((response) => {
      switch (response) {
        case 'accepted':
          return ApiSuccessResponse({
            type: options.type,
            description: options.message || 'Request accepted',
            isArray: options.isArray,
          });

        case 'created':
          return ApiCreatedSuccessResponse({
            type: options.type,
            description: options.message || 'Resource created successfully',
          });

        case 'paginated':
          return ApiOkResponsePaginated({
            type: options.type,
            description: options.message,
          });

        case 'null':
          return ApiSuccessResponseNullData({
            description: options.message || 'Resource modified successfully',
          });

        case 'patch':
          return ApiResponse({
            type: options.type,
            description: options.message || 'Resource updated successfully',
          });
        case 'unauthorized':
          return ApiUnauthorizedResponse({
            type: ApiErrorResponse,
            description: 'Unauthorized access',
          });
        case 'forbidden':
          return ApiForbiddenResponse({
            type: ApiErrorResponse,
            description: 'Forbidden access',
          });
        case 'notfound':
          return ApiNotFoundResponse({
            type: ApiErrorResponse,
            description: 'Resource not found',
          });
      }
    }),
    ApiBadRequestResponse({
      type: ApiErrorResponse,
      description: 'Validation error occurred',
    }),
    ApiInternalServerErrorResponse({
      type: ApiErrorResponse,
      description: 'An unexpected error occurred',
    }),
  );
}

type CustomResponses =
  | 'accepted'
  | 'created'
  | 'paginated'
  | 'patch'
  | 'null'
  | 'unauthorized'
  | 'forbidden'
  | 'notfound';
