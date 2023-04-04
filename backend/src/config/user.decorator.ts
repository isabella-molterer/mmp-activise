import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return data
      ? ctx.switchToHttp().getRequest().user &&
          ctx.switchToHttp().getRequest().user[data]
      : ctx.switchToHttp().getRequest().user;
  },
);
