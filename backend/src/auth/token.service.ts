import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ProviderTokensService } from '../provider-tokens/provider-tokens.service';
import { MemberTokensService } from '../member-tokens/member-tokens.service';
import { Member } from '../members/member.entity';
import { Provider } from '../providers/provider.entity';
import { MemberToken } from 'src/member-tokens/member-token.entity';
import { ProviderToken } from 'src/provider-tokens/provider-token.entity';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as moment from 'moment';

@Injectable()
export class TokenService {
  constructor(
    private readonly providerTokensService: ProviderTokensService,
    private readonly memberTokensService: MemberTokensService,
    private readonly jwtService: JwtService,
  ) {}

  async deleteTokenInDB(type: string, token: string) {
    if (type === 'member') {
      await this.memberTokensService.delete(token);
    } else if (type === 'provider') {
      await this.providerTokensService.delete(token);
    }
  }

  // create jwt payload
  createPayload(
    user: Member | Provider,
    type: string,
    expirationTime: number,
  ): JwtPayload {
    return {
      id: user.id,
      email: user.email,
      type: type,
      expirationTime: expirationTime,
    };
  }

  // create tokenString with payload
  async createToken(
    user: Member | Provider,
    type: string,
    defaultExpiration: number,
  ): Promise<string> {
    const payload = this.createPayload(user, type, defaultExpiration);
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: payload.expirationTime + 's',
    });
  }

  verifyToken(tokenString: string, options?: object): JwtPayload {
    try {
      return this.jwtService.verify(tokenString, { ...options });
    } catch (e) {
      throw new UnauthorizedException('The given token could not be verified');
    }
  }

  async retrieveValidToken(
    type: string,
    refreshToken: string,
  ): Promise<MemberToken | ProviderToken> {
    // check if refresh token exists in DB
    let token = null;
    if (type == 'member') {
      token = await this.memberTokensService.findOneByToken(refreshToken);
    } else if (type == 'provider') {
      token = await this.providerTokensService.findOneByToken(refreshToken);
    }
    if (token && token.expiresAt < moment().toDate()) {
      throw new UnauthorizedException('Refresh token has expired');
    }
    return token;
  }

  extractTokenFromHeaders(
    @Req() req: Request,
    extractBearerToken = ExtractJwt.fromAuthHeaderAsBearerToken(),
  ): string {
    const tokenString = extractBearerToken(req);
    if (!tokenString) {
      throw new NotFoundException('No token has been provided');
    }
    return tokenString;
  }

  async createForgottenPasswordToken(
    userFromDB: Provider | Member,
    type: string,
    expiration: number,
  ) {
    // create token for resetting password that lasts for 15 minutes
    const token = await this.createToken(userFromDB, type, expiration);
    if (type == 'member') {
      return (
        await this.memberTokensService.create(
          token,
          expiration,
          userFromDB as Member,
        )
      ).token;
    } else if (type == 'provider') {
      return (
        await this.providerTokensService.create(
          token,
          expiration,
          userFromDB as Provider,
        )
      ).token;
    }
  }
}
