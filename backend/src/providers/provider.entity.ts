import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  BeforeInsert,
  OneToOne,
  JoinColumn,
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
import { Address } from '../addresses/address.entity';
import { Member } from '../members/member.entity';
import { Link } from '../links/link.entity';
import { ProviderImages } from '../images/provider-images.entity';
import { Course } from '../courses/course.entity';
import { Validation } from '../validation';
import * as bcrypt from 'bcrypt';
import { ProviderToken } from '../provider-tokens/provider-token.entity';
import { Exclude } from 'class-transformer';
import { NumericTransformer } from '../config/numeric.transformer';

@Entity()
export class Provider extends Validation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ unique: true, length: 65 })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @IsNotEmpty()
  @IsString()
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

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @Column({ length: 25, nullable: true })
  @IsOptional()
  @IsPhoneNumber('AT')
  phoneNumber?: string;

  @Column({ length: 25 })
  @IsNotEmpty()
  @IsString()
  category: string;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  needsApproval: boolean;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished: boolean;

  @OneToOne(
    type => Address,
    address => address.provider,
    {
      cascade: true,
    },
  )
  address: Address;

  // n:n relation with members
  @ManyToMany(
    type => Member,
    member => member.providers,
    {
      onDelete: 'CASCADE',
    },
  )
  @IsOptional()
  members?: Member[];

  @OneToMany(
    type => Link,
    link => link.provider,
    {
      cascade: true,
    },
  )
  @IsOptional()
  links?: Link[];

  // 1:M relation with courses
  @OneToMany(
    type => Course,
    course => course.provider,
  )
  @IsOptional()
  courses?: Course[];

  // 1:m relation with tokens
  @OneToMany(
    type => ProviderToken,
    providerToken => providerToken.provider,
  )
  @IsOptional()
  providerTokens?: ProviderToken[];

  @OneToOne(
    type => ProviderImages,
    image => image,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn()
  @IsOptional()
  profileImage?: ProviderImages;

  @OneToMany(
    type => ProviderImages,
    image => image.provider,
    { onDelete: 'CASCADE' },
  )
  @IsOptional()
  slideShow?: ProviderImages[];

  @BeforeInsert()
  async hashPassword(password: string) {
    this.password = await bcrypt.hash(password || this.password, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }

  constructor(partial: Partial<Provider>) {
    super();
    Object.assign(this, partial);
  }
}
