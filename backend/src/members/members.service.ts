import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { MemberDto } from './member.dto';
import { MemberImageService } from '../images/member-image.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService extends TypeOrmCrudService<Member> {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly memberImageService: MemberImageService,
  ) {
    super(memberRepository);
  }

  async findOneById(id: number, options?: object): Promise<Member | undefined> {
    try {
      return await this.memberRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }
  }

  async findOneByEmail(email: string): Promise<Member | undefined> {
    try {
      return await this.memberRepository.findOneOrFail({ where: { email } });
    } catch {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }
  }

  async checkForExistingUser(email: string) {
    return (
      (await this.memberRepository.findOne({ where: { email } })) !== undefined
    );
  }

  async create(dto: MemberDto): Promise<Member> | undefined {
    const { email } = dto;
    if (await this.checkForExistingUser(email)) {
      throw new ConflictException('User already exists');
    }
    try {
      const member = await this.memberRepository.create({ ...dto });
      await this.memberRepository.save(member);
      return member;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: number, dto: MemberDto): Promise<Member> {
    // email checken ob nicht schon vorhanden beim update und entsprechendes update setzen
    const { email } = dto;
    const duplicateMember = await this.memberRepository.findOne({
      where: { email },
    });

    if (duplicateMember && duplicateMember.id != id) {
      throw new ConflictException('Email already taken');
    } else {
      try {
        let updateMember = await this.memberRepository.findOne({
          where: { id },
        });
        updateMember = Object.assign(updateMember, dto);
        return await this.memberRepository.save(updateMember);
      } catch (e) {
        throw new BadRequestException(e);
      }
    }
  }

  async deleteOneById(id: number) {
    try {
      const member = await this.findOneById(id, {
        relations: ['profileImage'],
      });
      if (member.profileImage) {
        await this.memberImageService.delete(member.profileImage);
      }
      return await this.memberRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'Could not delete member profile',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setPassword(email: string, newPassword: string): Promise<Member> {
    const member = await this.findOneByEmail(email);
    try {
      member.password = await bcrypt.hash(newPassword, 10);
      return await this.memberRepository.save(member);
    } catch (err) {
      throw new HttpException(
        'Could not update password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
