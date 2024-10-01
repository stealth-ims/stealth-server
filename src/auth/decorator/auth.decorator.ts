import { SetMetadata } from '@nestjs/common';

export const AUTHORIZE_KEY = 'authorize';
export const Authorize = () => SetMetadata(AUTHORIZE_KEY, true);
