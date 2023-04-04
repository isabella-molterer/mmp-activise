import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesMemberGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      // no roles in place
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // extract user from request --> needs to get attached at login

    const token = request.headers.authorization.split(' ')[1];
    const type = jwt.decode(token)['type'];

    if (
      type == 'member' &&
      (roles.includes('getProfile') ||
        this.memberEditMember(roles, request, user) ||
        this.memberUpdateMember(roles, request, user))
    ) {
      return true;
    }
    throw new UnauthorizedException(
      'Unauthorized: Malformed request or missing access permission rights',
    );
  }

  memberEditMember(roles, request, user) {
    if (roles.includes('editMember')) {
      if (request.params['id'] == user.id) {
        return true;
      }
    }
    return false;
  }

  memberUpdateMember(roles, request, user) {
    if (roles.includes('updateMember')) {
      if (request.params['id'] == user.id && user.id == request.body.id) {
        return true;
      }
    }
    return false;
  }
}
