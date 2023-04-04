import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Address } from './address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressesService extends TypeOrmCrudService<Address> {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {
    super(addressRepository);
  }

  async findOneById(id: number): Promise<Address> {
    try {
      return await this.addressRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
    }
  }
}
