import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from '../../src/addresses/addresses.service';
import { Address } from '../../src/addresses/address.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/mock-repo';
import {HttpException, HttpStatus} from "@nestjs/common";
import {createAddress} from "../factories/address.test.factory";

describe('AddressService', () => {
  let addressService: AddressesService;
  let mockAddressRepository: MockRepository<Address>;

  beforeEach(async () => {
    mockAddressRepository = new MockRepository<Address>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesService,
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepository
        }
      ],
    }).compile();

    addressService = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(addressService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a address object', async () => {
      const address = createAddress({});
      mockAddressRepository.findOneOrFail.mockReturnValue(address);
      expect(await addressService.findOneById(address.id)).toEqual(address);
    });

    it('should throw an exception when no address with that id was found', async () => {
      expect.assertions(3);
      mockAddressRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await addressService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Address not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
