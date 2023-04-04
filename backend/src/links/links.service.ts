import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Link } from './link.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LinksService extends TypeOrmCrudService<Link> {
  constructor(
    @InjectRepository(Link) private readonly linkRepository: Repository<Link>,
  ) {
    super(linkRepository);
  }

  async findOneById(id: number, options?: object): Promise<Link> {
    try {
      return await this.linkRepository.findOneOrFail({
        where: { id },
        ...options,
      });
    } catch {
      throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
    }
  }

  async deleteOneById(id: number) {
    try {
      return await this.linkRepository.delete(id);
    } catch (e) {
      throw new HttpException('Could not delete link', HttpStatus.BAD_REQUEST);
    }
  }
}
