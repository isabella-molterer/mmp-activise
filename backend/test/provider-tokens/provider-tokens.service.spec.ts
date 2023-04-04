import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderTokensService } from '../../src/provider-tokens/provider-tokens.service';
import { ProviderToken } from '../../src/provider-tokens/provider-token.entity';
import { jwtConstants } from '../../src/auth/constants';
import { MockRepository } from '../mocks/mock-repo';
import { createProviderToken } from '../factories/token.test.factory';
import { createProvider } from '../factories/provider.test.factory';

describe('ProviderTokensService', () => {
  let providerTokenService: ProviderTokensService;
  let mockProviderTokenRepository: MockRepository<ProviderToken>;

  beforeAll(async () => {
    mockProviderTokenRepository = new MockRepository<ProviderToken>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderTokensService,
        {
          provide: getRepositoryToken(ProviderToken),
          useValue: mockProviderTokenRepository
        },
      ],
    }).compile();

    providerTokenService = module.get<ProviderTokensService>(ProviderTokensService);
  });

  it('should be defined', () => {
    expect(providerTokenService).toBeDefined();
  });

  describe('findOneByToken', () => {
    it('should return a token', async () => {
      const providerToken = createProviderToken({});
      mockProviderTokenRepository.findOneOrFail.mockReturnValue(providerToken)
      expect(await providerTokenService.findOneByToken(providerToken.token)).toEqual(providerToken)
    })

    it('should throw a NotFound HttpException when no token that matches the token string was found', async () => {
      expect.assertions(3);
      mockProviderTokenRepository.findOneOrFail.mockImplementation(() => {
        throw 'findOneOrFail fails'
      })

      try {
        await providerTokenService.findOneByToken('');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Token expired or not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    })
  })

  describe('checkForExistingToken', () => {
    it('should return truthy if token exists', async () => {
      const providerToken = createProviderToken({});
      mockProviderTokenRepository.findOne.mockReturnValue(Promise.resolve({token: providerToken.token}));
      expect(await providerTokenService.checkForExistingToken(providerToken.token)).toBeTruthy();
    });

    it('should return falsy if token does not exists', async () => {
      const providerToken = createProviderToken({});
      mockProviderTokenRepository.findOne.mockReturnValue(Promise.resolve(undefined));
      expect(await providerTokenService.checkForExistingToken(providerToken.token)).toBeFalsy();
    });
  })

  describe('create', () => {
    it('should return saved token', async () => {
      const provider = createProvider({})
      const providerToken = createProviderToken({});
      const providerTokenServiceSpy = jest.spyOn(providerTokenService, "checkForExistingToken");
      providerTokenServiceSpy.mockReturnValue(Promise.resolve(undefined));

      mockProviderTokenRepository.create.mockReturnValue(providerToken)
      mockProviderTokenRepository.save.mockReturnValue(providerToken)
      expect(await providerTokenService.create(providerToken.token, jwtConstants.refreshDefaultExpiration, provider)).toEqual(providerToken);
    });

    it('should throw an Conflict Exception if token already exists', async () => {
      expect.assertions(3);

      const provider = createProvider({})
      const providerToken = createProviderToken({});
      const providerTokenServiceSpy = jest.spyOn(providerTokenService, "checkForExistingToken");
      providerTokenServiceSpy.mockReturnValue(Promise.resolve(true));

      try {
        await providerTokenService.create(providerToken.token, jwtConstants.refreshDefaultExpiration, provider)
      } catch(e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Duplicated token');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    })

    it('should throw an BadRequest Exception if the token can not be saved', async () => {
      expect.assertions(3);

      const provider = createProvider({})
      const providerToken = createProviderToken({});
      const providerTokenServiceSpy = jest.spyOn(providerTokenService, "checkForExistingToken");
      providerTokenServiceSpy.mockReturnValue(Promise.resolve(undefined));
  
      mockProviderTokenRepository.create.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await providerTokenService.create(providerToken.token, jwtConstants.refreshDefaultExpiration, provider)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Unable to store token in database');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  })

  describe('delete', () => {
    it('should delete token object', async () => {
      const providerToken = createProviderToken({});
      const providerTokenServiceSpy = jest.spyOn(providerTokenService, "findOneByToken");
      providerTokenServiceSpy.mockReturnValue(Promise.resolve(providerToken));
     
      mockProviderTokenRepository.delete.mockReturnValue(Promise.resolve({}));
      await providerTokenService.delete(providerToken.token)
      expect(providerTokenServiceSpy).toBeCalledTimes(1)
      expect(mockProviderTokenRepository.delete).toBeCalledTimes(1)
    })

    it('should throw Exception when unable to delete', async () => {
      expect.assertions(3);

      const providerToken = createProviderToken({});
      const providerTokenServiceSpy = jest.spyOn(providerTokenService, "findOneByToken");
      providerTokenServiceSpy.mockReturnValue(Promise.resolve(providerToken));
     
      mockProviderTokenRepository.delete.mockImplementation(() => {
        throw "Can not delete";
      })
      
      try {
        await providerTokenService.delete(providerToken.token)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not delete token');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    })
  })
});