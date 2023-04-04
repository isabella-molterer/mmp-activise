import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MemberDto } from './../members/member.dto';
import { ProviderDto } from './../providers/provider.dto';
import { HttpSuccessStatus } from './interfaces/http-success-status.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenService } from './token.service';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @ApiOperation({ summary: 'Renew AccessToken with RefreshToken' })
  @ApiOkResponse({ description: 'Access token renewed successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid grant: No refresh or access token has been provided',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid grant: invalid signature | Invalid grant: invalid token',
  })
  @ApiNotFoundResponse({ description: 'Refresh token could not be found' })
  @Get('/access_token')
  @ApiBearerAuth()
  async token(@Req() req: Request, @Res() res: Response) {
    // retrieve old access token from Auth Bearer Header
    const oldAccessTokenString = this.tokenService.extractTokenFromHeaders(req);
    // retrieve refresh token form http cookie
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new NotFoundException('No refresh token has been provided');
    }

    // verify and decode the old token to retrieve the userId - should also work when token is expired
    const oldToken = this.tokenService.verifyToken(oldAccessTokenString, {
      ignoreExpiration: true,
    });
    const tokens = await this.authService.getAccessTokenFromRefreshToken(
      refreshToken,
      oldToken.email,
      oldToken.type,
    );

    res.header(
      'Set-Cookie',
      'refreshToken =' + tokens.refreshToken + '; HttpOnly',
    );
    res.send({
      accessToken: tokens.accessToken,
    });
  }

  @ApiOperation({ summary: 'Login User' })
  @ApiCreatedResponse({
    description:
      'Returns valid access token and stores refresh token into the database',
  })
  @ApiUnauthorizedResponse({
    description: 'This email, password combination was not found',
  })
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const tokens = await this.authService.login(loginUserDto);
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new UnauthorizedException(
        'This email, password combination was not found',
      );
    }
    res.header(
      'Set-Cookie',
      'refreshToken =' + tokens.refreshToken + '; HttpOnly',
    );
    res.send({
      accessToken: tokens.accessToken,
    });
  }

  @ApiOperation({ summary: 'Register User' })
  @ApiCreatedResponse({ description: 'User has been created successfully' })
  @ApiBadRequestResponse({
    description: 'Empty or malformed request. User could not be registered',
  })
  @ApiConflictResponse({ description: 'User already exists' })
  @Post('/register')
  public async register(
    @Body() createUserDto: MemberDto | ProviderDto,
  ): Promise<HttpSuccessStatus> {
    await this.authService.register(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User has been registered successfully',
    };
  }

  @ApiOperation({ summary: 'Logout User' })
  @ApiOkResponse({ description: 'User got logged out successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid grant: No refresh or access token has been provided',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid grant: invalid signature | Invalid grant: invalid token',
  })
  @ApiNotFoundResponse({
    description:
      'User is probably already logged out. Refresh token could not be found',
  })
  @HttpCode(200)
  @Post('/logout')
  public async logout(@Req() req: Request): Promise<HttpSuccessStatus> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new BadRequestException('No refresh token has been provided');
    }
    const oldAccessToken = this.tokenService.extractTokenFromHeaders(req);

    // delete refresh token from database
    const status = await this.authService.logout(
      oldAccessToken as string,
      refreshToken,
    );

    // access token gets deleted by frontend!!!
    return {
      statusCode: status,
      message: 'User got logged out successfully',
    };
  }

  @ApiOperation({
    summary:
      'Send email when password got forgotten in order to reset password',
  })
  @ApiBadRequestResponse({
    description: 'Email not sent or could not creat forgot password token',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('forgot-password')
  public async sendEmailForgotPassword(
    @Req() req: Request,
  ): Promise<HttpSuccessStatus> {
    await this.authService.sendEmailForgotPassword(
      req.body.email,
      req.body.type,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Email sent successfully',
    };
  }

  @ApiOperation({ summary: 'Update or reset password for user' })
  @ApiBadRequestResponse({
    description:
      'Could not update password or new password cannot be old password',
  })
  @ApiUnauthorizedResponse({
    description:
      'Malformed request body or wrong current password or token could not be verified',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('reset-password')
  public async setNewPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<HttpSuccessStatus> {
    const {
      type,
      email,
      newPassword,
      currentPassword,
      newPasswordToken,
    } = resetPasswordDto;

    if (
      email &&
      type &&
      newPassword &&
      (type == 'member' || type == 'provider')
    ) {
      if (currentPassword) {
        const tokenString = this.tokenService.extractTokenFromHeaders(req);
        await this.authService.changePassword(
          email,
          currentPassword,
          newPassword,
          tokenString,
          type,
        );
      } else if (newPasswordToken) {
        await this.authService.resetPassword(
          email,
          newPasswordToken,
          newPassword,
          type,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Password got updated successfully',
      };
    } else {
      throw new BadRequestException(
        'Password could not be changed. Malformed request body',
      );
    }
  }
}
