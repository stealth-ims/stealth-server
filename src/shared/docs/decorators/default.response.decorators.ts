import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import {
  ApiSuccessResponse,
  ApiSuccessResponseNullData,
} from './response.decorators';
import { ApiOkResponsePaginated } from './paginated-success.response.decorators';
import { Authorize } from 'src/auth/decorator';

export function CustomApiResponse(
  responseTypes: CustomResponses[],
  options: { type?: any; message?: string; isArray?: boolean },
) {
  const docs = [
    ApiBadRequestResponse({
      type: ApiErrorResponse,
      description: 'Validation error occurred',
    }),
    ApiInternalServerErrorResponse({
      type: ApiErrorResponse,
      description: 'An unexpected error occurred',
    }),
  ];
  responseTypes.forEach((response) => {
    switch (response) {
      case 'success':
        docs.push(
          ApiSuccessResponse({
            type: options.type ?? 'any',
            description: options.message || 'Request successful',
            isArray: options.isArray,
          }),
        );
        break;
      case 'successNull':
        docs.push(
          ApiSuccessResponseNullData({
            description: options.message || 'Request successful',
          }),
        );
        break;
      case 'paginated':
        docs.push(
          ...[
            ApiOkResponsePaginated({
              type: options.type,
              description:
                options.message || 'Resources retrieved successfully',
            }),
          ],
        );
        break;
      case 'authorize':
        docs.push(
          ...[
            ApiForbiddenResponse({
              type: ApiErrorResponse,
              description: 'Forbidden access',
            }),
            ApiUnauthorizedResponse({
              type: ApiErrorResponse,
              description: 'Unauthorized access',
            }),
            Authorize(),
          ],
        );
        break;
      case 'notfound':
        docs.push(
          ApiNotFoundResponse({
            type: ApiErrorResponse,
            description: 'Resource not found',
          }),
        );
        break;
    }
  });

  return applyDecorators(...docs);
}

export type CustomResponses =
  | 'success'
  | 'successNull'
  | 'authorize'
  | 'paginated'
  | 'notfound';
