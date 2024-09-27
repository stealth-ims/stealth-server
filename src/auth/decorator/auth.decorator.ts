import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const Authorize = () =>
  applyDecorators(UseGuards(AuthGuard, RolesGuard));
