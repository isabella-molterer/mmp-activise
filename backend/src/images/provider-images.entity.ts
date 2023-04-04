import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Validation } from '../validation';
import { Provider } from '../providers/provider.entity';

@Entity()
export class ProviderImages extends Validation {
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
    type => Provider,
    provider => provider.profileImage,
  ) // specify inverse side as a second parameter
  @IsOptional()
  profileImage: Provider;

  @ManyToOne(
    type => Provider,
    provider => provider.slideShow,
  )
  @IsOptional()
  provider: Provider;
}
