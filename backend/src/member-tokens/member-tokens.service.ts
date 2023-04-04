import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { MemberToken } from './member-token.entity';
import { Member } from '../members/member.entity';
import * as moment from 'moment';

@Injectable()
export class MemberTokensService extends TypeOrmCrudService<MemberToken> {
  constructor(
    @InjectRepository(MemberToken)
    private readonly tokenRepository: Repository<MemberToken>,
  ) {
    super(tokenRepository);
  }

  async findOneByToken(token: string): Promise<MemberToken | undefined> {
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
    member: Member,
  ): Promise<MemberToken> {
    if (await this.checkForExistingToken(token)) {
      throw new HttpException('Duplicated token', HttpStatus.CONFLICT);
    }

    try {
      const refreshToken: MemberToken = await this.tokenRepository.create({
        token,
        expiresAt: moment()
          .add(expiration, 's')
          .format(),
      });
      refreshToken.member = member; // member object not just id
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
