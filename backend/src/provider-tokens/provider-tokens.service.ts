import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ProviderToken } from './provider-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '../providers/provider.entity';
import * as moment from 'moment';

@Injectable()
export class ProviderTokensService extends TypeOrmCrudService<ProviderToken> {
  constructor(
    @InjectRepository(ProviderToken)
    private readonly tokenRepository: Repository<ProviderToken>,
  ) {
    super(tokenRepository);
  }

  async findOneByToken(token: string): Promise<ProviderToken | undefined> {
    try {
      return await this.tokenRepository.findOneOrFail({ where: { token } });
    } catch {
      throw new NotFoundException('Token expired or not found');
    }
  }

  async checkForExistingToken(token: string) {
    return (
      (await this.tokenRepository.findOne({ where: { token } })) !== undefined
    );
  }

  async create(
    token: string,
    expiration: number,
    provider: Provider,
  ): Promise<ProviderToken> {
    if (await this.checkForExistingToken(token)) {
      throw new HttpException('Duplicated token', HttpStatus.CONFLICT);
    }

    try {
      const refreshToken: ProviderToken = await this.tokenRepository.create({
        token,
        expiresAt: moment()
          .add(expiration, 's')
          .format(),
      });
      refreshToken.provider = provider; // member object not just id
      return await this.tokenRepository.save(refreshToken);
    } catch (err) {
      throw new HttpException(
        'Unable to store token in database',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(refreshToken: string) {
    const token = await this.findOneByToken(refreshToken);
    try {
      await this.tokenRepository.delete(token);
    } catch (err) {
      throw new HttpException('Could not delete token', HttpStatus.BAD_REQUEST);
    }
  }
}
