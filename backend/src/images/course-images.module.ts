import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseImages } from './course-images.entity';
import { CourseImagesService } from './course-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseImages])],
  providers: [CourseImagesService],
  exports: [CourseImagesService],
})
export class CourseImagesModule {}
