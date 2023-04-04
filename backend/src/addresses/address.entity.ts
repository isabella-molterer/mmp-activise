import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Provider } from '../providers/provider.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Validation } from '../validation';

@Entity()
export class Address extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

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

  @OneToOne(
    type => Provider,
    provider => provider,
    { onDelete: 'CASCADE' },
  ) // specify inverse side as a second parameter
  @JoinColumn()
  provider: Provider;
}
