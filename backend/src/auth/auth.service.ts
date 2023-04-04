import {
  HttpStatus,
  Injectable,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { ProvidersService } from '../providers/providers.service';
import { jwtConstants } from './constants';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ProviderTokensService } from '../provider-tokens/provider-tokens.service';
import { MemberTokensService } from '../member-tokens/member-tokens.service';
import { Member } from '../members/member.entity';
import { Provider } from '../providers/provider.entity';
import { MemberDto } from './../members/member.dto';
import { ProviderDto } from './../providers/provider.dto';
import { MemberToken } from 'src/member-tokens/member-token.entity';
import { ProviderToken } from 'src/provider-tokens/provider-token.entity';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly providersService: ProvidersService,
    private readonly providerTokensService: ProviderTokensService,
    private readonly memberTokensService: MemberTokensService,
    private readonly tokenService: TokenService,
    private configService: ConfigService,
  ) {}
  // helper
  async findUserByEmail(
    email: string,
    type: string,
  ): Promise<Member | Provider> {
    if (type === 'member') {
      return await this.membersService.findOneByEmail(email);
    } else if (type === 'provider') {
      return await this.providersService.findOneByEmail(email);
    }
  }

  async storeRefreshToken(refreshToken, type, userFromDB) {
    if (type === 'member') {
      await this.memberTokensService.create(
        refreshToken,
        jwtConstants.refreshDefaultExpiration,
        userFromDB as Member,
      );
    } else if (type === 'provider') {
      await this.providerTokensService.create(
        refreshToken,
        jwtConstants.refreshDefaultExpiration,
        userFromDB as Provider,
      );
    }
  }

  async register(
    registerAttempt: MemberDto | ProviderDto,
  ): Promise<Member | Provider> {
    const { type } = registerAttempt;

    if (type === 'member') {
      return await this.membersService.create(registerAttempt as MemberDto);
    } else if (type === 'provider') {
      return await this.providersService.create(registerAttempt as ProviderDto);
    } else {
      // check if request body is not empty {}
      throw new BadRequestException('Empty or malformed request body');
    }
  }

  async login(loginAttempt: LoginUserDto) {
    const { email, password, type } = loginAttempt;
    const userFromDB = await this.findUserByEmail(email, type);
    if (userFromDB && (await userFromDB.checkPassword(password))) {
      const refreshToken = await this.tokenService.createToken(
        userFromDB,
        type,
        jwtConstants.refreshDefaultExpiration,
      );
      const accessToken = await this.tokenService.createToken(
        userFromDB,
        type,
        jwtConstants.accessDefaultExpiration,
      );

      // try to store refresh token in DB
      await this.storeRefreshToken(refreshToken, type, userFromDB);

      // return both access and refresh token
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }
  }

  async authenticateUserByJwt(payload: JwtPayload): Promise<Member | Provider> {
    const { email, type } = payload;
    // check if there exists a user in db and return him
    return await this.findUserByEmail(email, type);
  }

  async logout(
    oldAccessToken: string,
    refreshToken: string,
  ): Promise<HttpStatus> {
    // get user type by decoding old token
    const type = this.tokenService.verifyToken(oldAccessToken, {
      ignoreExpiration: true,
    })['type'];
    await this.tokenService.deleteTokenInDB(type, refreshToken);
    return HttpStatus.OK;
  }

  // REGARDING TOKENS:
  async getAccessTokenFromRefreshToken(
    refreshToken: string,
    email: string,
    type: string,
  ) {
    const token = await this.tokenService.retrieveValidToken(
      type,
      refreshToken,
    );
    return await this.renewTokenForUser(token, email, type);
  }

  async renewTokenForUser(
    token: MemberToken | ProviderToken,
    email: string,
    type: string,
  ) {
    const userFromDB = await this.findUserByEmail(email, type);
    const accessToken = await this.tokenService.createToken(
      userFromDB,
      type,
      jwtConstants.accessDefaultExpiration,
    );

    //Remove old refresh token from db
    await this.tokenService.deleteTokenInDB(type, token.token);

    // generate new refresh token
    const refreshToken = await this.tokenService.createToken(
      userFromDB,
      type,
      jwtConstants.refreshDefaultExpiration,
    );

    // store new refresh token in db
    await this.storeRefreshToken(refreshToken, type, userFromDB);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  // REGARDING PWD CHANGE
  // function compares the given password parameter with the user password in the database
  // isCurrentPassword is true, if the user wants to reset his password while being logged in using his current password to authenticate
  // isCurrentPassword is false, if the user wants to reset his password via email, providing a completely new password which should not be the same as the old password
  async checkPasswordForUser(
    email: string,
    password: string,
    type: string,
    isCurrentPassword: boolean,
  ): Promise<boolean> {
    const userFromDb = await this.findUserByEmail(email, type);
    // check if given current password matches user password in database
    if (isCurrentPassword) {
      if (await userFromDb.checkPassword(password)) return true;
      throw new BadRequestException('Wrong current password');
      // check if given new password is not the same as user password in database (current password)
    } else {
      if (!(await userFromDb.checkPassword(password))) return true;
      throw new BadRequestException('New password cannot be old password');
    }
  }

  async updatePasswordForUser(
    email: string,
    newPassword: string,
    type: string,
  ): Promise<Member | Provider> {
    if (type == 'member') {
      return await this.membersService.setPassword(email, newPassword);
    } else if (type == 'provider') {
      return await this.providersService.setPassword(email, newPassword);
    }
  }

  async changePassword(email, currentPassword, newPassword, tokenString, type) {
    const isValidPasswordCombo =
      (await this.checkPasswordForUser(email, currentPassword, type, true)) &&
      (await this.checkPasswordForUser(email, newPassword, type, false));
    const token = this.tokenService.verifyToken(tokenString);
    if (isValidPasswordCombo && token.email == email && token.type == type) {
      await this.updatePasswordForUser(email, newPassword, type);
    }
  }

  async resetPassword(email, newPasswordToken, newPassword, type) {
    // retrieve token from database and verify it
    const tokenFromDB = await this.tokenService.retrieveValidToken(
      type,
      newPasswordToken,
    );
    const token = this.tokenService.verifyToken(tokenFromDB.token);

    if (token.email == email && token.type == type) {
      await this.checkPasswordForUser(email, newPassword, type, false);
      await this.updatePasswordForUser(email, newPassword, type);
      // delete forgottenPasswordToken from MemberToken or ProviderToken DB table after updating pwd
      await this.tokenService.deleteTokenInDB(type, tokenFromDB.token);
    } else {
      throw new BadRequestException(
        'Malformed request body: Email does not match',
      );
    }
  }

  // REGARDING MAIL
  private createMailOptions(email: string, forgottenPasswordToken: string) {
    return {
      from:
        '"Activise" <' + this.configService.get<string>('mail.auth.user') + '>',
      to: email, // list of receivers (separated by ,)
      subject: 'Frogotten Password',
      text: 'Forgot Password',
      html:
        'Hi! <br><br> If you requested to reset your password<br><br>' +
        '<a href=' +
        this.configService.get<string>('frontend_url') +
        '/reset-password?token=' +
        forgottenPasswordToken +
        '>Click here</a>', // html body
    };
  }

  async sendEmailForgotPassword(email: string, type: string): Promise<boolean> {
    const userFromDB = await this.findUserByEmail(email, type);
    const forgottenPasswordToken = await this.tokenService.createForgottenPasswordToken(
      userFromDB,
      type,
      jwtConstants.accessDefaultExpiration,
    );

    if (forgottenPasswordToken) {
      try {
        const transporter = nodemailer.createTransport({
          ...this.configService.get<any>('mail'),
        });
        const mailOptions = this.createMailOptions(
          email,
          forgottenPasswordToken,
        );

        return await new Promise<boolean>(async function(resolve, reject) {
          return await transporter.sendMail(mailOptions, async error => {
            if (error) {
              return reject(false);
            }
            resolve(true);
          });
        });
      } catch (e) {
        throw new HttpException(
          'An error occurred when sending the email',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
