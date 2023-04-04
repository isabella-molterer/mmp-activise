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
import { MembersService } from './members.service';
import { Member } from './member.entity';
import { Crud, CrudController, Override } from '@nestjsx/crud';
import { MemberDto } from './member.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { MemberImageService } from '../images/member-image.service';
import { Fileoptions } from '../config/aws';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesMemberGuard } from '../auth/roles/rolesMember.guard';
import { HttpSuccessStatus } from '../auth/interfaces/http-success-status.interface';
import { MemberImage } from 'src/images/member-image.entity';

@Crud({
  model: {
    type: Member,
  },
  routes: {
    exclude: [
      'createOneBase',
      'createManyBase',
      'getOneBase',
      'getManyBase',
      'replaceOneBase',
    ],
  },
  query: {
    join: {
      providers: {
        eager: true,
      },
      courses: {
        eager: true,
      },
      profileImage: {
        exclude: ['key'],
        eager: true,
      },
    },
  },
})
@ApiTags('members')
@Controller()
export class MembersController {
  constructor(
    public service: MembersService,
    public memberImageService: MemberImageService,
  ) {}

  get base(): CrudController<Member> {
    return this;
  }

  // GET OWN PROFILE
  @ApiOperation({ summary: 'Get personal profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('getProfile')
  @Get('me')
  async getProfile(@Req() req): Promise<Member> {
    return this.service.findOneById(req.user.id, {
      relations: ['courses', 'providers', 'profileImage'],
    });
  }

  // UPDATE OWN PROFILE
  @Override()
  @Patch(':id')
  @ApiOperation({ summary: 'Update personal profile' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiConflictResponse({ description: 'Email already taken' })
  @ApiBadRequestResponse({
    description: 'Could not update member or malformed request',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('updateMember')
  async updateOne(@Param('id') id: number, @Body() dto: MemberDto) {
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
  @ApiBadRequestResponse({ description: 'Could not delete member' })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('editMember')
  @Delete(':id')
  async deleteOne(@Param('id') id: number): Promise<HttpSuccessStatus> {
    await this.service.deleteOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile got deleted successfully',
    };
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Upload new profile image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({
    description:
      'Could not upload image to aws or delete image from aws or could not save image or no file submitted',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('editMember')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Fileoptions,
  ): Promise<MemberImage> {
    if (file) {
      const member = await this.service.findOneById(id);
      return await this.memberImageService.create(member, file);
    } else {
      throw new HttpException('No file submitted', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Change profile image' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({ description: 'Could not update profile image' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('editMember')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') id: number,
    @UploadedFile() file: Fileoptions,
  ): Promise<MemberImage> {
    if (file) {
      const member = await this.service.findOneById(id, {
        relations: ['profileImage'],
      });
      return await this.memberImageService.update(member, file);
    } else {
      throw new HttpException('No file submitted', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Delete profile image' })
  @ApiOkResponse({ description: 'Image got deleted successfully' })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized: Malformed request or missing access permission rights',
  })
  @ApiBadRequestResponse({
    description:
      'Could not delete image from database or aws or could not update profile image',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RolesMemberGuard)
  @Roles('editMember')
  @UseInterceptors(FileInterceptor('image'))
  async deleteImage(@Param('id') id: number): Promise<HttpSuccessStatus> {
    const member = await this.service.findOneById(id, {
        relations: ['profileImage'],
      }),
      currentImage = member.profileImage;
    if (currentImage) {
      await this.memberImageService.delete(currentImage);
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
}
