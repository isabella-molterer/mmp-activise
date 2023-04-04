import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseImages } from './course-images.entity';
import { Course } from '../courses/course.entity';
import { Aws, Fileoptions } from '../config/aws';

@Injectable()
export class CourseImagesService {
  constructor(
    @InjectRepository(CourseImages)
    private readonly courseImagesRepository: Repository<CourseImages>,
  ) {}

  async findOneById(id: number, options?: object): Promise<CourseImages> {
    try {
      return await this.courseImagesRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(
    course: Course,
    file: Fileoptions,
  ): Promise<CourseImages | undefined> {
    const fileparams = await Aws.uploadFileToS3(file, course.id, 'courses');

    try {
      let imageObj = {
        url: fileparams.fileurl,
        key: fileparams.filename,
        course: course,
        profileImage: null,
      };

      if (!course.profileImage) {
        imageObj = { ...imageObj, profileImage: course };
      }

      const image: CourseImages = await this.courseImagesRepository.create(
        imageObj,
      );
      return await this.courseImagesRepository.save(image);
    } catch (e) {
      await Aws.deleteFileFromAws(fileparams.params);
      throw new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    course: Course,
    image: CourseImages,
  ): Promise<CourseImages | undefined> {
    try {
      image.profileImage = course;
      return await this.courseImagesRepository.save(image);
    } catch (e) {
      throw new HttpException(
        'Could not update profile image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(image: CourseImages) {
    const params = Aws.getParamsForAws(image);
    await Aws.deleteFileFromAws(params);
    try {
      return await this.courseImagesRepository.delete(image);
    } catch (e) {
      throw new HttpException('Could not delete image', HttpStatus.BAD_REQUEST);
    }
  }
}
