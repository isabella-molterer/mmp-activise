import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { CoursesService } from '../../courses/courses.service';
import { CourseImagesService } from '../../images/course-images.service';

@Injectable()
export class RolesCourseGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    public courseService: CoursesService,
    public courseImageService: CourseImagesService,
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
    if (type == 'provider') {
      if (
        this.providerCreateOwnCourse(roles, request, user) ||
        (await this.providerEditCourseImages(roles, request, user))
      ) {
        return true;
      } else {
        const course = await this.courseService.findOneById(
          request.params['id'],
          { relations: ['provider'] },
        );
        if (
          this.providerEditOwnCourse(roles, course, user, request) ||
          this.providerGetOrDeleteCourseDetails(roles, course, user)
        ) {
          return true;
        }
      }
    }
    throw new UnauthorizedException(
      'Unauthorized: Malformed request or missing access permission rights',
    );
  }

  providerCreateOwnCourse(roles, request, user) {
    if (roles.includes('createOwnCourse')) {
      if (request.body.provider == user.id) {
        return true;
      }
    }
    return false;
  }

  async providerEditCourseImages(roles, request, user) {
    if (roles.includes('editImagesCourses')) {
      const course = await this.courseService.findOneById(
        request.params['id'],
        { relations: ['provider', 'slideShow'] },
      );
      const testImage = await this.courseImageService.findOneById(
        request.params['imageid'],
      );

      if (
        course.provider.id == user.id &&
        course.slideShow.filter(image => image.id === testImage.id).length > 0
      ) {
        return true;
      }
    }
    return false;
  }

  providerGetOrDeleteCourseDetails(roles, course, user) {
    if (
      roles.includes('getOwnCourse') ||
      roles.includes('deleteOwnCourse') ||
      roles.includes('uploadImageCourse')
    ) {
      if (course.provider.id == user.id) {
        return true;
      }
    }
    return false;
  }

  providerEditOwnCourse(roles, course, user, request) {
    if (roles.includes('editOwnCourse')) {
      if (
        course.provider.id == user.id &&
        request.params['id'] == request.body.id &&
        request.body.provider == course.provider.id
      ) {
        return true;
      }
    }
    return false;
  }
}
