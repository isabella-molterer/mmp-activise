import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Validation } from '../validation';
import { DateTransformer } from '../config/date.transformer';

@ValidatorConstraint({ name: 'isAfter', async: false })

export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return propertyValue > args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be after "${args.constraints[0]}"`;
  }
}

@Entity()
export class CourseDate extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer(),
  })
  @IsNotEmpty()
  @IsDateString()
  from: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer(),
  })
  @Validate(IsAfterConstraint, ['from'])
  @IsNotEmpty()
  @IsDateString()
  to: Date;

  @Column({ length: 100 })
  @IsNotEmpty()
  @IsString()
  street: string;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  zip: string;

  @Column({ length: 35 })
  @IsNotEmpty()
  @IsString()
  city: string;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ManyToOne(
    type => Course,
    course => course.courseDates,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinColumn()
  @IsNotEmpty()
  course: Course;

  constructor(from: Date, to: Date) {
    super();
    this.from = from;
    this.to = to;
  }
}
