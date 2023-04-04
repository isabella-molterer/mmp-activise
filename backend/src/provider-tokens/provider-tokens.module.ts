import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderToken } from './provider-token.entity';
import { ProviderTokensService } from './provider-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderToken])],
  providers: [ProviderTokensService],
  exports: [ProviderTokensService],
})
export class ProviderTokensModule {}
