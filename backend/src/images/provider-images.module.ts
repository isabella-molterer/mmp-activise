import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderImages } from './provider-images.entity';
import { ProviderImagesService } from './provider-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderImages])],
  providers: [ProviderImagesService],
  exports: [ProviderImagesService],
})
export class ProviderImagesModule {}
