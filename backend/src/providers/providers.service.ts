import {
  HttpException,
  HttpStatus,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from './provider.entity';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ProviderDto } from './provider.dto';
import { ProviderImagesService } from '../images/provider-images.service';
import { CoursesService } from '../courses/courses.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProvidersService extends TypeOrmCrudService<Provider> {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly courseService: CoursesService,
    private readonly providerImagesService: ProviderImagesService,
  ) {
    super(providerRepository);
  }

  async findOneById(id: number, options?: object): Promise<Provider> {
    try {
      const provider = await this.providerRepository.findOneOrFail({
        where: { id },
        ...options,
      });
      return new Provider({ ...provider });
    } catch {
      throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);
    }
  }

  async findOneByEmail(email: string): Promise<Provider | undefined> {
    try {
      return await this.providerRepository.findOneOrFail({ where: { email } });
    } catch {
      throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);
    }
  }

  async checkForExistingUser(email: string) {
    return (
      (await this.providerRepository.findOne({ where: { email } })) !==
      undefined
    );
  }

  async update(id: number, dto: ProviderDto): Promise<Provider> {
    const { email } = dto;
    const duplicateProvider = await this.providerRepository.findOne({
      where: { email },
    });

    if (duplicateProvider && duplicateProvider.id != id) {
      throw new ConflictException('Email already taken');
    } else {
      try {
        let updateProvider = await this.providerRepository.findOne({
          where: { id },
        });
        updateProvider = Object.assign(updateProvider, dto);
        return await this.providerRepository.save(updateProvider);
      } catch (e) {
        throw new BadRequestException(e);
      }
    }
  }

  async create(dto: ProviderDto): Promise<Provider | undefined> {
    const { email } = dto;
    if (await this.checkForExistingUser(email)) {
      throw new ConflictException('User already exists');
    }
    try {
      const provider = await this.providerRepository.create({ ...dto });
      return await this.providerRepository.save(provider);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async deleteOneById(id: number) {
    try {
      const provider = await this.findOneById(id, {
        relations: ['slideShow', 'courses'],
      });
      for (const course of provider.courses) {
        await this.courseService.deleteOneById(course.id);
      }
      for (const image of provider.slideShow) {
        await this.providerImagesService.delete(image);
      }
      return await this.providerRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'Could not delete provider',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setPassword(email: string, newPassword: string): Promise<Provider> {
    const provider = await this.findOneByEmail(email);
    try {
      provider.password = await bcrypt.hash(newPassword, 10);
      return await this.providerRepository.save(provider);
    } catch (err) {
      throw new HttpException(
        'Could not update password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
