import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
} from 'class-validator';
import { Provider } from '../providers/provider.entity';
import { Course } from '../courses/course.entity';
import * as bcrypt from 'bcrypt';
import { Validation } from '../validation';
import { MemberToken } from '../member-tokens/member-token.entity';
import { MemberImage } from '../images/member-image.entity';
import { DateTransformer } from '../config/date.transformer';
import { Exclude } from 'class-transformer';

@Entity()
export class Member extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ unique: true, length: 65 })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsDateString()
  @Column('date', {
    default: null,
    nullable: true,
    transformer: new DateTransformer(),
  })
  birthday?: Date;

  // n:n relation with providers
  @ManyToMany(
    type => Provider,
    provider => provider.members,
    { onDelete: 'CASCADE' },
  )
  @JoinTable()
  @IsOptional()
  providers?: Provider[];

  // n:n relation with providers
  @ManyToMany(
    type => Course,
    course => course.members,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinTable()
  @IsOptional()
  courses?: Course[];

  // 1:m relation with tokens
  @OneToMany(
    type => MemberToken,
    memberToken => memberToken.member,
  )
  @IsOptional()
  memberTokens?: MemberToken[];

  @OneToOne(
    type => MemberImage,
    image => image.profileImage,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn()
  @IsOptional()
  profileImage?: MemberImage;

  @BeforeInsert()
  async hashPassword(password: string) {
    this.password = await bcrypt.hash(password || this.password, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
