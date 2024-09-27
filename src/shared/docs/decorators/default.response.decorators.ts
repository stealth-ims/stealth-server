import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import { ApiSuccessResponse } from './response.decorators';

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
          return ApiCreatedResponse({
            type: options.type,
            description: options.message || 'Resource created successfully',
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
  | 'patch'
  | 'unauthorized'
  | 'forbidden'
  | 'notfound';
