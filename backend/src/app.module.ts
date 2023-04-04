import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './members/members.module';
import { ProvidersModule } from './providers/providers.module';
import { AddressesModule } from './addresses/addresses.module';
import { LinksModule } from './links/links.module';
import { CoursesModule } from './courses/courses.module';
import { CourseDatesModule } from './course-dates/course-dates.module';
import { DynamicModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from 'nest-router';
import { routes } from './config/routes';
import { MemberTokensModule } from './member-tokens/member-tokens.module';
import { ProviderTokensModule } from './provider-tokens/provider-tokens.module';
import * as ormconfig from './ormconfig';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { default as mailerconfig } from './config/mailer.config';

export function DatabaseOrmModule(): DynamicModule {
  return TypeOrmModule.forRoot(ormconfig);
}

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    RouterModule.forRoutes(routes),
    MembersModule,
    ProvidersModule,
    AddressesModule,
    LinksModule,
    CoursesModule,
    CourseDatesModule,
    AuthModule,
    MemberTokensModule,
    ProviderTokensModule,
    MulterModule.register({
      dest: './files',
    }),
    ConfigModule.forRoot({
      load: [mailerconfig],
      envFilePath: '.env.development',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
