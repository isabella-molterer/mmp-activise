import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  Crud,
  CrudController,
  CrudRequest,
  GetManyDefaultResponse,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { Provider } from './provider.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProviderDto } from './provider.dto';
import { ProviderImagesService } from '../images/provider-images.service';
import { ProviderImages } from 'src/images/provider-images.entity';
import { Fileoptions } from '../config/aws';
import { AuthGuard } from '@nestjs/passport';
import { LinksService } from '../links/links.service';
import { RolesProviderGuard } from '../auth/roles/rolesProvider.guard';
import { Roles } from '../auth/roles/roles.decorator';
import {
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { HttpSuccessStatus } from '../auth/interfaces/http-success-status.interface';
import { CoursesService } from '../courses/courses.service';

@Crud({
  model: {
    type: Provider,
  },
  routes: {
    exclude: ['createOneBase', 'createManyBase', 'replaceOneBase'],
  },
  query: {
    join: {
      address: {
        eager: true,
      },
      courses: {
        eager: true,
      },
      links: {
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
    },
    filter: [
      {
        field: 'isPublished',
        operator: '$eq',
        value: true,
      },
    ],
  },
})
@ApiTags('providers')
@Controller()
export class ProvidersController {
  constructor(
    public service: ProvidersService,
    public providerImagesService: ProviderImagesService,
    public coursesService: CoursesService,
    public linkService: LinksService,
  ) {}

  // GET OWN PROFILE
  @ApiOperation({ summary: 'Get personal profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('getProfile')
  @Get('me')
  async getProfile(@Req() req): Promise<Provider> {
    return this.service.findOneById(req.user.id, {
      relations: ['address', 'courses', 'links', 'profileImage', 'slideShow'],
    });
  }

  get base(): CrudController<Provider> {
    return this;
  }

  // ONLY PUBLISHED - get by ID
  @Override()
  @ApiOperation({ summary: 'Get one Provider' })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @UseInterceptors(ClassSerializerInterceptor)
  async getOne(@ParsedRequest() req: CrudRequest): Promise<Provider> {
    const provider = await this.base.getOneBase(req);
    provider.courses = this.coursesService.removeUnpublishedCourses(
      provider.courses,
    );
    return provider;
  }

  // ONLY PUBLISHED - get ALL
  @Override()
  @ApiOperation({ summary: 'Get all Providers' })
  @UseInterceptors(ClassSerializerInterceptor)
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ): Promise<GetManyDefaultResponse<Provider> | Provider[]> {
    const providers = await this.base.getManyBase(req);
    if (providers instanceof Array) {
      providers.forEach(provider => {
        provider.courses = this.coursesService.removeUnpublishedCourses(
          provider.courses,
        );
      });
    } else {
      providers.data.forEach(provider => {
        provider.courses = this.coursesService.removeUnpublishedCourses(
          provider.courses,
        );
      });
    }
    return providers;
  }

  // UPDATE OWN PROFILE
  @Override()
  @ApiOperation({ summary: 'Update personal profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiConflictResponse({ description: 'Email already taken' })
  @ApiBadRequestResponse({
    description: 'Could not update provider or malformed request',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('updateProvider')
  @Patch(':id')
  async updateOne(@Param('id') id: number, @Body() dto: ProviderDto) {
    if (dto.password) {
      throw new HttpException('Malformed request', HttpStatus.BAD_REQUEST);
    }
    return await this.service.update(id, dto);
  }

  //DELETE OWN PROFILE
  @ApiOperation({ summary: 'Delete personal profile' })
  @ApiOkResponse({ description: 'Profile got deleted successfully' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({ description: 'Could not delete provider' })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('editProvider')
  @Delete(':id')
  async deleteOne(@Param('id') id: number): Promise<HttpSuccessStatus> {
    await this.service.deleteOneById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile got deleted successfully',
    };
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Upload new slideshow image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Provider not found' })
  @ApiBadRequestResponse({
    description:
      'Could not upload image to aws or delete image from aws or could not save image or no file submitted',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('editProvider')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Fileoptions,
  ): Promise<ProviderImages> {
    if (file) {
      const provider = await this.service.findOneById(id, {
        relations: ['profileImage'],
      });
      return await this.providerImagesService.create(provider, file);
    } else {
      throw new HttpException('No file submitted', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/images/:imageid')
  @ApiOperation({ summary: 'Change profile image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Provider image not found' })
  @ApiBadRequestResponse({ description: 'Could not update profile image' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('editImageProvider')
  @UseInterceptors(FileInterceptor('image'))
  async setProfileImage(
    @Param('id') id: number,
    @Param('imageid') imageid: number,
  ): Promise<ProviderImages> {
    const provider = await this.service.findOneById(id, {
      relations: ['profileImage'],
    });
    const newImage = await this.providerImagesService.findOneById(imageid, {
      relations: ['provider'],
    });
    return await this.providerImagesService.update(provider, newImage);
  }

  @Delete(':id/images/:imageid')
  @ApiOperation({ summary: 'Delete slideshow image' })
  @ApiOkResponse({ description: 'Image got deleted successfully' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiNotFoundResponse({ description: 'Provider image not found' })
  @ApiBadRequestResponse({
    description:
      'Could not delete image from database or aws or could not update profile image',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('editImageProvider')
  @UseInterceptors(FileInterceptor('image'))
  async deleteImageFromSlideshow(
    @Param('id') id: number,
    @Param('imageid') imageid: number,
  ): Promise<HttpSuccessStatus> {
    const currentImage = await this.providerImagesService.findOneById(imageid);

    if (currentImage) {
      await this.providerImagesService.delete(currentImage);
      const provider = await this.service.findOneById(id, {
        relations: ['profileImage', 'slideShow'],
      });
      if (!provider.profileImage && provider.slideShow.length > 0) {
        await this.providerImagesService.update(
          provider,
          provider.slideShow[0],
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Image got deleted successfully',
      };
    } else {
      throw new HttpException(
        'User does not have a profile image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/links/:linkid')
  @UseGuards(AuthGuard('jwt'), RolesProviderGuard)
  @Roles('deleteLinkProvider')
  @ApiOperation({ summary: 'Delete one provider link' })
  @ApiOkResponse({ description: 'Link got deleted successfully' })
  @ApiNotFoundResponse({ description: 'Link not found' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({ description: 'Could not delete link' })
  async deleteLink(
    @Param('linkid') linkid: number,
  ): Promise<HttpSuccessStatus> {
    await this.linkService.deleteOneById(linkid);
    return {
      statusCode: HttpStatus.OK,
      message: 'Link got deleted successfully',
    };
  }
}
