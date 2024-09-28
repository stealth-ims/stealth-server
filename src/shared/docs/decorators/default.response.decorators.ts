import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import { ApiSuccessResponse } from './response.decorators';
import { ApiOkResponsePaginated } from './paginated-success.response.decorators';
import { PaginationDocs } from './get-queries.decorator';
import { Authorize } from 'src/auth/decorator';

export function CustomApiResponse(
  responseTypes: CustomResponses[],
  options: { type: any; message?: string; isArray?: boolean },
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
            type: options.type,
            description: options.message || 'Request successful',
            isArray: options.isArray,
          }),
        );
        break;
      case 'filter':
        docs.push(
          ...[
            ApiOkResponsePaginated({
              type: options.type,
              description:
                options.message || 'Resources retrieved successfully',
            }),
            PaginationDocs(),
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
            ApiBearerAuth('access-token'),
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

type CustomResponses = 'success' | 'authorize' | 'filter' | 'notfound';
