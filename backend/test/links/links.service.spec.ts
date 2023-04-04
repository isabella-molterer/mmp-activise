import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from '../../src/links/links.service';
import { MockRepository } from '../mocks/mock-repo';
import { Link } from '../../src/links/link.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import {createLink} from "../factories/link.test.factory";

describe('LinksService', () => {
  let linksService: LinksService;
  let mockLinkRepository: MockRepository<Link>;

  beforeAll(async () => {
    mockLinkRepository = new MockRepository<Link>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockLinkRepository
        },
      ],
    }).compile();

    linksService = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(linksService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a link object', async () => {
      const link = createLink({})
      mockLinkRepository.findOneOrFail.mockResolvedValue(link)
      expect(await linksService.findOneById(link.id)).toEqual(link)
    })

    it('should throw an exception when no link with that id was found', async () => {
      expect.assertions(3);
      mockLinkRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await linksService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Link not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  })

  describe('deleteOneById', () => {
    it('should return deleted link object', async () => {
      const link = createLink({})
      mockLinkRepository.delete.mockResolvedValue(link)
      expect(await linksService.deleteOneById(link.id)).toEqual(link)
    })

    it('should throw Exception when unable to delete', async () => {
      expect.assertions(3);
      mockLinkRepository.delete.mockImplementation(() => {
        throw "delete fails";
      });
      try {
        await linksService.deleteOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not delete link');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    })
  })
});
