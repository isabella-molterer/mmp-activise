import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../providers/provider.entity';
import { ProviderImages } from './provider-images.entity';
import { Aws, Fileoptions } from '../config/aws';

@Injectable()
export class ProviderImagesService {
  constructor(
    @InjectRepository(ProviderImages)
    private readonly providerImagesRepository: Repository<ProviderImages>,
  ) {}

  async findOneById(id: number, options?: object): Promise<ProviderImages> {
    try {
      return await this.providerImagesRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(
    provider: Provider,
    file: Fileoptions,
  ): Promise<ProviderImages | undefined> {
    const fileparams = await Aws.uploadFileToS3(file, provider.id, 'providers');

    try {
      let imageObj = {
        url: fileparams.fileurl,
        key: fileparams.filename,
        provider: provider,
        profileImage: null,
      };

      if (!provider.profileImage) {
        imageObj = { ...imageObj, profileImage: provider };
      }

      const image: ProviderImages = await this.providerImagesRepository.create(
        imageObj,
      );
      return await this.providerImagesRepository.save(image);
    } catch (e) {
      await Aws.deleteFileFromAws(fileparams.params);
      throw new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    provider: Provider,
    image: ProviderImages,
  ): Promise<ProviderImages> {
    try {
      image.profileImage = provider;
      return await this.providerImagesRepository.save(image);
    } catch (e) {
      throw new HttpException(
        'Could not update profile image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(image: ProviderImages) {
    const params = Aws.getParamsForAws(image);
    await Aws.deleteFileFromAws(params);
    try {
      return await this.providerImagesRepository.delete(image);
    } catch (e) {
      throw new HttpException('Could not delete image', HttpStatus.BAD_REQUEST);
    }
  }
}
