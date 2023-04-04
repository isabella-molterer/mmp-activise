import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseDatesService } from './course-dates.service';
import { CourseDate } from './course-date.entity';
import { AddressesModule } from '../addresses/addresses.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseDate]),
    AddressesModule,
    CoursesModule,
  ],
  providers: [CourseDatesService],
  exports: [CourseDatesService],
})
export class CourseDatesModule {}
