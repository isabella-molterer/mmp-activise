import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { ProvidersModule } from '../providers/providers.module';
import { MemberTokensModule } from '../member-tokens/member-tokens.module';
import { ProviderTokensModule } from '../provider-tokens/provider-tokens.module';
import { UserJwtStrategy } from './strategies/jwtUser.strategy';
import { TokenModule } from './token.module';

@Module({
  imports: [
    MembersModule,
    MemberTokensModule,
    ProvidersModule,
    ProviderTokensModule,
    TokenModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserJwtStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
