import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberImage } from './member-image.entity';
import { Repository } from 'typeorm';
import { Member } from '../members/member.entity';
import { Aws, Fileoptions } from '../config/aws';

@Injectable()
export class MemberImageService {
  constructor(
    @InjectRepository(MemberImage)
    private readonly memberImageRepository: Repository<MemberImage>,
  ) {}

  async findOneById(
    id: number,
    options?: object,
  ): Promise<MemberImage | undefined> {
    try {
      return await this.memberImageRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(member: Member, file: Fileoptions) {
    const fileparams = await Aws.uploadFileToS3(file, member.id, 'members');
    try {
      const image: MemberImage = await this.memberImageRepository.create({
        url: fileparams.fileurl,
        key: fileparams.filename,
        profileImage: member,
      });
      return await this.memberImageRepository.save(image);
    } catch (e) {
      await Aws.deleteFileFromAws(fileparams.params);
      throw new HttpException(
        'Could not update profile image of member',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(member: Member, file: Fileoptions): Promise<MemberImage> {
    const image = member.profileImage,
      fileparamsOld = Aws.getParamsForAws(image);
    await Aws.deleteFileFromAws(fileparamsOld);
    const fileparams = await Aws.uploadFileToS3(file, member.id, 'members');

    try {
      image.url = fileparams.fileurl;
      image.key = fileparams.filename;
      return await this.memberImageRepository.save(image);
    } catch (e) {
      throw new HttpException(
        'Could not update profile image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(image: MemberImage) {
    const params = Aws.getParamsForAws(image);
    await Aws.deleteFileFromAws(params);
    try {
      return await this.memberImageRepository.delete(image);
    } catch (e) {
      throw new HttpException('Could not delete image', HttpStatus.BAD_REQUEST);
    }
  }
}
