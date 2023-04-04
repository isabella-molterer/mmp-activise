import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MemberTokensService } from '../../src/member-tokens/member-tokens.service';
import { MemberToken } from '../../src/member-tokens/member-token.entity';
import {jwtConstants} from "../../src/auth/constants"
import { MockRepository } from '../mocks/mock-repo';
import { createMemberToken } from '../factories/token.test.factory';
import { createMember } from '../factories/member.test.factory';

describe('MemberTokensService', () => {
  let memberTokenService: MemberTokensService;
  let mockMemberTokenRepository: MockRepository<MemberToken>;

  beforeAll(async () => {
    mockMemberTokenRepository = new MockRepository<MemberToken>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberTokensService,
        {
          provide: getRepositoryToken(MemberToken),
          useValue: mockMemberTokenRepository
        },
      ],
    }).compile();

    memberTokenService = module.get<MemberTokensService>(MemberTokensService);
  });

  it('should be defined', () => {
    expect(memberTokenService).toBeDefined();
  });

  describe('findOneByToken', () => {
    it('should return a token', async () => {
      const memberToken = createMemberToken({});
      mockMemberTokenRepository.findOneOrFail.mockReturnValue(memberToken)
      expect(await memberTokenService.findOneByToken(memberToken.token)).toEqual(memberToken)
    })

    it('should throw a NotFound HttpException when no token that matches the token string was found', async () => {
      expect.assertions(3);
      mockMemberTokenRepository.findOneOrFail.mockImplementation(() => {
        throw 'findOneOrFail fails'
      })

      try {
        await memberTokenService.findOneByToken('');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Token expired or not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    })
  })

  describe('checkForExistingToken', () => {
    it('should return truthy if token exists', async () => {
      const memberToken = createMemberToken({});
      mockMemberTokenRepository.findOne.mockReturnValue(Promise.resolve({token: memberToken.token}));
      expect(await memberTokenService.checkForExistingToken(memberToken.token)).toBeTruthy();
    });

    it('should return falsy if token does not exists', async () => {
      const memberToken = createMemberToken({});
      mockMemberTokenRepository.findOne.mockReturnValue(Promise.resolve(undefined));
      expect(await memberTokenService.checkForExistingToken(memberToken.token)).toBeFalsy();
    });
  })

  describe('create', () => {
    it('should return saved token', async () => {
      const member = createMember({})
      const memberToken = createMemberToken({});
      const memberTokenServiceSpy = jest.spyOn(memberTokenService, "checkForExistingToken");
      memberTokenServiceSpy.mockReturnValue(Promise.resolve(undefined));

      mockMemberTokenRepository.create.mockReturnValue(memberToken)
      mockMemberTokenRepository.save.mockReturnValue(memberToken)
      expect(await memberTokenService.create(memberToken.token, jwtConstants.refreshDefaultExpiration, member)).toEqual(memberToken);
    });

    it('should throw an Conflict Exception if token already exists', async () => {
      expect.assertions(3);
      const member = createMember({})
      const memberToken = createMemberToken({});
      const memberTokenServiceSpy = jest.spyOn(memberTokenService, "checkForExistingToken");
      memberTokenServiceSpy.mockReturnValue(Promise.resolve(true));

      try {
        await memberTokenService.create(memberToken.token, jwtConstants.refreshDefaultExpiration, member)
      } catch(e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Duplicated token');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    })

    it('should throw an BadRequest Exception if the token can not be saved', async () => {
      expect.assertions(3);

      const member = createMember({})
      const memberToken = createMemberToken({});
      const memberTokenServiceSpy = jest.spyOn(memberTokenService, "checkForExistingToken");
      memberTokenServiceSpy.mockReturnValue(Promise.resolve(undefined));

      mockMemberTokenRepository.create.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await memberTokenService.create(memberToken.token, jwtConstants.refreshDefaultExpiration, member)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Unable to store token in database');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  })

  describe('delete', () => {
    it('should delete token object', async () => {
      const memberToken = createMemberToken({});
      const memberTokenServiceSpy = jest.spyOn(memberTokenService, "findOneByToken");
      memberTokenServiceSpy.mockReturnValue(Promise.resolve(memberToken));
     
      mockMemberTokenRepository.delete.mockReturnValue(Promise.resolve({}));
      await memberTokenService.delete(memberToken.token)
      expect(memberTokenServiceSpy).toBeCalledTimes(1)
      expect(mockMemberTokenRepository.delete).toBeCalledTimes(1)
    })

    it('should throw Exception when unable to delete', async () => {
      expect.assertions(3);

      const memberToken = createMemberToken({});
      const memberTokenServiceSpy = jest.spyOn(memberTokenService, "findOneByToken");
      memberTokenServiceSpy.mockReturnValue(Promise.resolve(memberToken));
     
      mockMemberTokenRepository.delete.mockImplementation(() => {
        throw "Can not delete";
      })
      
      try {
        await memberTokenService.delete(memberToken.token)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not delete token');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    })
  })
});
