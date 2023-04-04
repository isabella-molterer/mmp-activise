import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CourseDate } from './course-date.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseDatesService extends TypeOrmCrudService<CourseDate> {
  constructor(
    @InjectRepository(CourseDate)
    private readonly courseDateRepository: Repository<CourseDate>,
  ) {
    super(courseDateRepository);
  }

  async findOneById(id: number): Promise<CourseDate> {
    try {
      return await this.courseDateRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new HttpException('Course Date not found', HttpStatus.NOT_FOUND);
    }
  }
}
