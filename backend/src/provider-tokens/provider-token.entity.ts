import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Provider } from '../providers/provider.entity';

@Entity()
export class ProviderToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, unique: true })
  @IsNotEmpty()
  token: string;

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @ManyToOne(
    type => Provider,
    provider => provider.providerTokens,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  )
  @JoinColumn()
  @IsNotEmpty()
  provider: Provider;
}
