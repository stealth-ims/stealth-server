import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: Payload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

type Payload =
  | 'sub'
  | 'email'
  | 'facility'
  | 'department'
  | 'role'
  | 'permissions'
  | 'session';
