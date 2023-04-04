import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Body,
  Post,
  UploadedFile,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UnauthorizedException,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import {
  Crud,
  CrudController,
  CrudRequest,
  GetManyDefaultResponse,
  Override,
  ParsedRequest,
  ParsedBody,
} from '@nestjsx/crud';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseImagesService } from '../images/course-images.service';
import { Fileoptions } from '../config/aws';
import { CourseDto } from './course.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesCourseGuard } from '../auth/roles/rolesCourse.guard';
import { User } from '../config/user.decorator';
import { AuthGuardUser } from '../auth/AuthGuardUser';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { HttpSuccessStatus } from 'src/auth/interfaces/http-success-status.interface';
import { CourseImages } from 'src/images/course-images.entity';

@Crud({
  dto: {
    create: CourseDto,
    update: CourseDto,
  },
  routes: {
    exclude: ['createManyBase', 'replaceOneBase'],
  },
  model: {
    type: Course,
  },
  query: {
    join: {
      courseDates: {
        eager: true,
      },
      'courseDates.address': {
        allow: ['city', 'zip', 'street', 'country'],
        eager: true,
      },
      profileImage: {
        exclude: ['key'],
        eager: true,
      },
      slideShow: {
        exclude: ['key'],
        eager: true,
      },
      provider: {
        eager: true,
      },
    },
    filter: [
      {
        field: 'isPublished',
        operator: '$eq',
        value: true,
      },
      {
        field: 'provider.isPublished',
        operator: '$eq',
        value: true,
      },
    ],
  },
})
@ApiTags('courses')
@Controller()
export class CoursesController {
  constructor(
    public service: CoursesService,
    public courseImagesService: CourseImagesService,
  ) {}

  get base(): CrudController<Course> {
    return this;
  }

  // ONLY PUBLISHED - get by ID
  @UseGuards(AuthGuardUser)
  @ApiOperation({ summary: 'Get course profile' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Missing access permission rights',
  })
  @Get(':id')
  async getOne(
    @User() user,
    @Param('id') id: number,
    @Req() request,
    extractBearerToken = ExtractJwt.fromAuthHeaderAsBearerToken(),
  ): Promise<Course> {
    const token = extractBearerToken(request);
    const course = await this.service.findOneById(id, {
      relations: ['provider', 'courseDates', 'profileImage', 'slideShow'],
    });

    if (course.isPublished && course.provider.isPublished) {
      return course;
    } else if (token) {
      const type = jwt.decode(token)['type'];
      if (user.id == course.provider.id && type == 'provider') {
        return course;
      }
    }
    throw new UnauthorizedException('Missing access permission rights');
  }

  // ONLY PUBLISHED - get ALL
  @Override()
  @ApiOperation({ summary: 'Get all Courses' })
  @UseInterceptors(ClassSerializerInterceptor)
  getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<GetManyDefaultResponse<Course> | Course[]> {
    return this.base.getManyBase(req);
  }

  @Override()
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @Roles('createOwnCourse')
  @ApiOperation({ summary: 'Create Course' })
  @ApiBadRequestResponse({ description: 'Malformed request: Validation error' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @HttpCode(201)
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() course: Course,
  ): Promise<Course> | undefined {
    return await this.base.createOneBase(req, course);
  }

  // UPDATE OWN PROFILE
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @Roles('editOwnCourse')
  @ApiOperation({ summary: 'Update course profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({ description: 'Malformed request: Validation error' })
  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: CourseDto) {
    return this.service.update(id, dto);
  }

  //DELETE OWN PROFILE
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @ApiOperation({ summary: 'Delete course profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({ description: 'Malformed request: Validation error' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiOkResponse({ description: 'Course profile got deleted successfully' })
  @Roles('deleteOwnCourse')
  @Delete(':id')
  async deleteOne(@Param('id') id: number): Promise<HttpSuccessStatus> {
    await this.service.deleteOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course profile got deleted successfully',
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @Roles('uploadImageCourse')
  @Post(':id/image')
  @ApiOperation({ summary: 'Upload new slideshow image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiBadRequestResponse({
    description:
      'Could not upload image to aws or delete image from aws or could not save image or no file submitted',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Fileoptions,
  ): Promise<CourseImages> {
    if (file) {
      const course = await this.service.findOneById(id, {
        relations: ['profileImage'],
      });
      return await this.courseImagesService.create(course, file);
    } else {
      throw new HttpException('No file submitted', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/images/:imageid')
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @ApiOperation({ summary: 'Change course profile image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Course image not found' })
  @ApiBadRequestResponse({
    description: 'Could not update course profile image',
  })
  @Roles('editImagesCourses')
  @UseInterceptors(FileInterceptor('image'))
  async setProfileImage(
    @Param('id') id: number,
    @Param('imageid') imageid: number,
  ): Promise<CourseImages> {
    const course = await this.service.findOneById(id, {
      relations: ['profileImage'],
    });
    const newImage = await this.courseImagesService.findOneById(imageid, {
      relations: ['course'],
    });
    return await this.courseImagesService.update(course, newImage);
  }

  @Delete(':id/images/:imageid')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Delete slideshow image' })
  @ApiOkResponse({ description: 'Image got deleted successfully' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Course image not found' })
  @ApiBadRequestResponse({
    description:
      'Could not delete image from database or aws or could not update course profile image',
  })
  @UseGuards(AuthGuard('jwt'), RolesCourseGuard)
  @Roles('editImagesCourses')
  @UseInterceptors(FileInterceptor('image'))
  async deleteImageFromSlideshow(
    @Param('id') id: number,
    @Param('imageid') imageid: number,
  ): Promise<HttpSuccessStatus> {
    const currentImage = await this.courseImagesService.findOneById(imageid);

    await this.courseImagesService.delete(currentImage);
    const course = await this.service.findOneById(id, {
      relations: ['profileImage', 'slideShow'],
    });
    if (!course.profileImage && course.slideShow.length > 0) {
      await this.courseImagesService.update(course, course.slideShow[0]);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Image got deleted successfully',
    };
  }
}
