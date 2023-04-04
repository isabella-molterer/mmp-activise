import { Test } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MemberTokensService } from "../../src/member-tokens/member-tokens.service";
import { ProviderTokensService } from "../../src/provider-tokens/provider-tokens.service";
import { TokenService } from "../../src/auth/token.service";
import { MockJwtService } from "../mocks/mock-jwt.service";
import { createMember } from "../factories/member.test.factory";
import { createMemberToken, createPayload, createProviderToken } from "../factories/token.test.factory";
import { jwtConstants } from "../../src/auth/constants";
import { MockUserTokenService } from "../mocks/mock-user-token-service";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import moment = require("moment");
import * as httpMocks from "node-mocks-http"
import { createProvider } from "../factories/provider.test.factory";

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockJwtService: MockJwtService;

  let mockMemberTokensService: MockUserTokenService;
  let mockProviderTokensService: MockUserTokenService;
  
  beforeEach(async () => {
    mockJwtService = new MockJwtService();
    mockMemberTokensService = new MockUserTokenService();
    mockProviderTokensService = new MockUserTokenService();
   
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secretOrPrivateKey: 'secret',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        TokenService,
        {
          provide: ProviderTokensService,
          useValue: mockProviderTokensService
        },
        {
          provide: MemberTokensService,
          useValue: mockMemberTokensService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ]
    }).compile()

    tokenService = await module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(mockJwtService).toBeDefined();
    expect(mockProviderTokensService).toBeDefined();
    expect(mockMemberTokensService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('deleteTokenInDB', () => {
    it('should call memberTokensService.delete once if type is member', async () => {
      await tokenService.deleteTokenInDB('member', 'token')
      expect(mockMemberTokensService.delete).toBeCalledTimes(1)
    })

    it('should call providerTokensService.delete once if type is provider', async () => {
      await tokenService.deleteTokenInDB('provider', 'token')
      expect(mockProviderTokensService.delete).toBeCalledTimes(1)
    })
  })

  describe('createPayload', () => {
    it('should return a payload object', () => {
      const member = createMember({})
      const type = 'member'
      const payload = tokenService.createPayload(member, type, jwtConstants.accessDefaultExpiration)
  
      expect(payload).toHaveProperty('id', member.id)
      expect(payload).toHaveProperty('email', member.email)
      expect(payload).toHaveProperty('type', type)
      expect(payload).toHaveProperty('expirationTime', jwtConstants.accessDefaultExpiration)
    })    
  })

  describe('createToken', () => {
    it('should return a token string', async () => {
      const member = createMember({})
      const type = 'member'
      const tokenString = 'token'
      const createTokenSpy = jest.spyOn(tokenService, "createPayload");
      createTokenSpy.mockReturnValue(createPayload({}))

      mockJwtService.sign.mockReturnValue(tokenString)
      expect(await tokenService.createToken(member, type, jwtConstants.accessDefaultExpiration)).toEqual(tokenString)
    })    
  })

  describe('verifyToken', () => {
    it('should verify a token string and return a token', async () => {
      const tokenString = 'token';
      const token = createMemberToken({});
      mockJwtService.verify.mockReturnValue(token)

      expect(tokenService.verifyToken(tokenString)).toEqual(token)
    })    

    it('should throw UnauthorizedException if verifying fails', async () => {
      expect.assertions(2);
      const tokenString = 'token';

      mockJwtService.verify.mockImplementation(() => {
        throw 'verifying fails'
      })

      try {
        await tokenService.verifyToken(tokenString)
      } catch (e) {
          expect(e).toBeInstanceOf(UnauthorizedException);
          expect(e.message).toBe('The given token could not be verified');
      }
    })    
  })

  describe('retrieveValidToken', () => {
    it('should return a refresh token for member if not expired', async () => {
      const tokenString = 'token';
      const token = createMemberToken({});
      const type = 'member';
    
      const mockMemberTokensServiceSpy = jest.spyOn(mockMemberTokensService, "findOneByToken");
      mockMemberTokensServiceSpy.mockReturnValue(Promise.resolve(token))
      expect(await tokenService.retrieveValidToken(type, tokenString)).toEqual(token)
    })

    it('should return a refresh token for provider if not expired', async () => {
      const tokenString = 'token';
      const token = createProviderToken({});
      const type = 'provider';
    
      const mockProviderTokensServiceSpy = jest.spyOn(mockProviderTokensService, "findOneByToken");
      mockProviderTokensServiceSpy.mockReturnValue(Promise.resolve(token))
      expect(await tokenService.retrieveValidToken(type, tokenString)).toEqual(token)
    })

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      expect.assertions(2);
      const tokenString = 'token';
      const token = createProviderToken({});
      token.expiresAt = moment().subtract(1, 's').toDate()
      const type = 'provider';

      const mockProviderTokensServiceSpy = jest.spyOn(mockProviderTokensService, "findOneByToken");
      mockProviderTokensServiceSpy.mockReturnValue(Promise.resolve(token))

      try {
        await tokenService.retrieveValidToken(type, tokenString)
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Refresh token has expired');
      }
    })
  })

  describe('createForgottenPasswordToken', () => {
    it('should return token string for member', async () => {
      const tokenString = 'token'
      const member = createMember({})
      
      const createTokenSpy = jest.spyOn(tokenService, "createToken")
      createTokenSpy.mockReturnValue(Promise.resolve(tokenString))
      
      const mockMemberTokensServiceSpy = jest.spyOn(mockMemberTokensService, "create");
      mockMemberTokensServiceSpy.mockReturnValue(Promise.resolve(createMemberToken({})))

      expect(await tokenService.createForgottenPasswordToken(member, 'member', jwtConstants.refreshDefaultExpiration)).toEqual(tokenString)
    })

    it('should return token string for provider', async () => {
      const tokenString = 'token'
      const provider = createProvider({})
      
      const createTokenSpy = jest.spyOn(tokenService, "createToken")
      createTokenSpy.mockReturnValue(Promise.resolve(tokenString))
      
      const mockProviderTokensServiceSpy = jest.spyOn(mockProviderTokensService, "create");
      mockProviderTokensServiceSpy.mockReturnValue(Promise.resolve(createProviderToken({})))

      expect(await tokenService.createForgottenPasswordToken(provider, 'provider', jwtConstants.refreshDefaultExpiration)).toEqual(tokenString)
    })
  })

  describe('extractTokenFromHeaders', () => {
    it('should return token string', async () => {
      const tokenString = 'token'
      const token = createProviderToken({});
      const mockRequest = httpMocks.createRequest({
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });
      const extractBearerToken = jest.fn(() => tokenString);

      expect(await tokenService.extractTokenFromHeaders(mockRequest, extractBearerToken)).toEqual(tokenString)
      expect(extractBearerToken).toBeCalledWith(mockRequest)
    })

    it('should throw a NotFound Exception if no bearer token was provided in auth - called with 1 parameter', async () => {
      const mockRequest = httpMocks.createRequest({});

      expect.assertions(2);
      try {
        await tokenService.extractTokenFromHeaders(mockRequest)
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('No token has been provided');
      }
    })

    it('should throw a NotFound Exception if no bearer token was provided in auth - called with 2 parameters', async () => {
      const mockRequest = httpMocks.createRequest({});
      const extractBearerToken = jest.fn(() => null);

      expect.assertions(2);
      try {
        await tokenService.extractTokenFromHeaders(mockRequest, extractBearerToken)
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('No token has been provided');
      }
    })
  })
})  