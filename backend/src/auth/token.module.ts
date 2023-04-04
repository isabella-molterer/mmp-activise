import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { MemberTokensModule } from '../member-tokens/member-tokens.module';
import { ProviderTokensModule } from '../provider-tokens/provider-tokens.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Module({
  imports: [
    MemberTokensModule,
    ProviderTokensModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          privateKey: configService
            .get('JWT_PRIVATE_KEY')
            .replace(/\\n/gm, '\n'),
          publicKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/gm, '\n'),
        };
        return options;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
