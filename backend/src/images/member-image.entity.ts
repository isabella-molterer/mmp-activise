import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Validation } from '../validation';
import { Member } from '../members/member.entity';

@Entity()
export class MemberImage extends Validation {
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
    type => Member,
    member => member.profileImage,
  ) // specify inverse side as a second parameter
  @IsOptional()
  profileImage: Member;
}
