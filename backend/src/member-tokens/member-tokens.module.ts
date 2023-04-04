import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberToken } from './member-token.entity';
import { MemberTokensService } from './member-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberToken])],
  providers: [MemberTokensService],
  exports: [MemberTokensService],
})
export class MemberTokensModule {}
