import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const AUTHORIZE_KEY = 'authorize';
export const Secure = () => SetMetadata(AUTHORIZE_KEY, true);
export const Authorize = () => {
  return applyDecorators(ApiBearerAuth('access-token'), Secure());
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
