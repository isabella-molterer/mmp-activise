import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsUrl, IsNotEmpty, IsString } from 'class-validator';
import { Provider } from '../providers/provider.entity';
import { Validation } from '../validation';

@Entity()
export class Link extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @IsNotEmpty()
  @IsString()
  linkText: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ManyToOne(
    type => Provider,
    provider => provider.links,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  provider: Provider;
}
