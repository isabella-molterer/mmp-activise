import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberImageService } from './member-image.service';
import { MemberImage } from './member-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberImage])],
  providers: [MemberImageService],
  exports: [MemberImageService],
})
export class MemberImageModule {}
