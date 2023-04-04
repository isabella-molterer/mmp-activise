import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ProviderImagesService } from '../../images/provider-images.service';
import { LinksService } from '../../links/links.service';

@Injectable()
export class RolesProviderGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    public providerImagesService: ProviderImagesService,
    public linkService: LinksService,
  ) {}

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

    // PROVIDER
    if (
      type == 'provider' &&
      (roles.includes('getProfile') ||
        this.providerEditProvider(roles, request, user) ||
        this.providerUpdateProvider(roles, request, user) ||
        (await this.providerEditImageProvider(roles, request, user)) ||
        (await this.providerDeleteLinkProvider(roles, request, user)))
    ) {
      return true;
    }
    throw new UnauthorizedException(
      'Unauthorized: Malformed request or missing access permission rights',
    );
  }

  providerEditProvider(roles, request, user) {
    if (roles.includes('editProvider')) {
      if (request.params['id'] == user.id) {
        return true;
      }
    }
    return false;
  }

  providerUpdateProvider(roles, request, user) {
    if (roles.includes('updateProvider')) {
      if (request.params['id'] == user.id && user.id == request.body.id) {
        return true;
      }
    }
    return false;
  }

  async providerEditImageProvider(roles, request, user) {
    if (roles.includes('editImageProvider')) {
      const image = await this.providerImagesService.findOneById(
        request.params.imageid,
        { relations: ['provider'] },
      );
      if (
        image &&
        user.id == image.provider.id &&
        request.params['id'] == user.id
      ) {
        return true;
      }
    }
    return false;
  }

  async providerDeleteLinkProvider(roles, request, user) {
    if (roles.includes('deleteLinkProvider')) {
      const link = await this.linkService.findOneById(
        request.params['linkid'],
        { relations: ['provider'] },
      );
      if (
        link &&
        user.id == link.provider.id &&
        request.params['id'] == user.id &&
        request.params['linkid'] == link.id
      ) {
        return true;
      }
    }
    return false;
  }
}
