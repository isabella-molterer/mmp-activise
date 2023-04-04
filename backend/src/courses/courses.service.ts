import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Course } from './course.entity';
import { Repository } from 'typeorm';
import { CourseDto } from './course.dto';
import { CourseImagesService } from '../images/course-images.service';

@Injectable()
export class CoursesService extends TypeOrmCrudService<Course> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private courseImagesService: CourseImagesService,
  ) {
    super(courseRepository);
  }

  async findOneById(id: number, options?: object): Promise<Course | undefined> {
    try {
      return await this.courseRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: number, dto: CourseDto): Promise<Course> {
    try {
      let updateCourse = await this.findOneById(id, { relations: ['members'] });
      updateCourse = Object.assign(updateCourse, dto);
      return await this.courseRepository.save(updateCourse);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async deleteOneById(id: number) {
    try {
      const course = await this.findOneById(id, { relations: ['slideShow'] });
      for (const image of course.slideShow) {
        await this.courseImagesService.delete(image);
      }
      return await this.courseRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'Could not delete course',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  removeUnpublishedCourses(courses: Course[]): Course[] | undefined {
    const filteredCourses = courses.filter(course => course.isPublished === true);
    return filteredCourses;
  }
}
