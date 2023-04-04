import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { Member } from './member.entity';
import { MembersController } from './members.controller';
import { MemberImageModule } from '../images/member-image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), MemberImageModule],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
