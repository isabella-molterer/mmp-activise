import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './provider.entity';
import { ProviderImagesModule } from '../images/provider-images.module';
import { CoursesModule } from '../courses/courses.module';
import { LinksModule } from '../links/links.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider]),
    ProviderImagesModule,
    CoursesModule,
    LinksModule,
    AddressesModule,
  ],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
