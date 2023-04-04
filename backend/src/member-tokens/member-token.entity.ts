import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Member } from '../members/member.entity';

@Entity()
export class MemberToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, unique: true })
  @IsNotEmpty()
  token: string;

  // timestamp -- date + time --> maybe check with Liz
  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @ManyToOne(
    type => Member,
    member => member.memberTokens,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinColumn()
  @IsNotEmpty()
  member: Member;
}
