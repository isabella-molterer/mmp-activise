import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Validation } from '../validation';
import { Course } from '../courses/course.entity';

@Entity()
export class CourseImages extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  key: string;

  @OneToOne(
    type => Course,
    course => course.profileImage,
  ) // specify inverse side as a second parameter
  @IsOptional()
  profileImage: Course;

  @ManyToOne(
    type => Course,
    course => course.slideShow,
    { onDelete: 'SET NULL' },
  )
  @IsOptional()
  course: Course;
}
