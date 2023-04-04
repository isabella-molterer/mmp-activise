import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';
import { Provider } from '../providers/provider.entity';
import { Member } from '../members/member.entity';
import { CourseDate } from '../course-dates/course-date.entity';
import { Validation } from '../validation';
import { CourseImages } from '../images/course-images.entity';
import { NumericTransformer } from '../config/numeric.transformer';

@Entity()
export class Course extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  instructor?: string;

  @Column({ length: 25, nullable: true })
  @IsPhoneNumber('AT')
  @IsOptional()
  phoneNumber?: string;

  @Column({ length: 65 })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  description: string;

  @Column({ type: 'decimal' })
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @Column('numeric', {
    precision: 7,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  price: number;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsNumber()
  maxParticipants: number;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  category: string;

  @Column({ length: 25, nullable: true })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  equipment?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Column()
  @IsNotEmpty()
  @IsBoolean()
  trialDay: boolean;

  @Column()
  @IsNotEmpty()
  @IsBoolean()
  isPrivate: boolean;

  @Column({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  isPublished: boolean;

  @ManyToOne(
    type => Provider,
    provider => provider.courses,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinColumn()
  @IsNotEmpty()
  provider: Provider;

  // n:n relation with members
  @ManyToMany(
    type => Member,
    member => member.courses,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinTable()
  @IsOptional()
  members?: Member[];

  @OneToMany(
    type => CourseDate,
    courseDate => courseDate.course,
    { cascade: true },
  )
  @IsOptional()
  courseDates?: CourseDate[];

  @OneToOne(
    type => CourseImages,
    image => image.profileImage,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn()
  @IsOptional()
  profileImage?: CourseImages;

  @OneToMany(
    type => CourseImages,
    image => image.course,
    { onDelete: 'CASCADE' },
  )
  @IsOptional()
  slideShow?: CourseImages[];
}
