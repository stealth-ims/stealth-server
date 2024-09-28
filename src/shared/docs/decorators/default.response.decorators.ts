import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiSeeOtherResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import { ApiSuccessResponse } from './response.decorators';

export function CustomApiResponse(responseTypes: CustomResponses[], options: { type: any, message?: string, isArray?: boolean }) {
  const docs = [ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: 'Validation error occurred',
  }),
  ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occurred',
  })];
  responseTypes.forEach((response) => {
    switch (response) {
      case 'success':
        docs.push(ApiSuccessResponse({
          type: options.type,
          description: options.message || 'Request successful',
          isArray: options.isArray
        }));
        break;
      case 'unauthorized':
        docs.push(...[ApiForbiddenResponse({
          type: ApiErrorResponse,
          description: 'Forbidden access',
        }), ApiUnauthorizedResponse({
          type: ApiErrorResponse,
          description: 'Unauthorized access',
        })]);
        break;
      case 'notfound':
        docs.push(ApiNotFoundResponse({
          type: ApiErrorResponse,
          description: 'Resource not found',
        }));
        break;
    }
  });

  return applyDecorators(
    ...docs
  );
}

type CustomResponses =
  | 'success'
  | 'unauthorized'
  | 'notfound';
