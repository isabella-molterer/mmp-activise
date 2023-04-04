import { Test } from "@nestjs/testing";
import { ConfigService } from '@nestjs/config';
import { AuthService } from "../../src/auth/auth.service";
import { Member } from "../../src/members/member.entity";
import { Provider } from "../../src/providers/provider.entity";
import { TokenService } from "../../src/auth/token.service";
import { MembersService } from "../../src/members/members.service";
import { ProvidersService } from "../../src/providers/providers.service";
import { ProviderTokensService } from "../../src/provider-tokens/provider-tokens.service";
import { MemberTokensService } from "../../src/member-tokens/member-tokens.service";
import { MockTokenService } from "../mocks/mock-token-service";
import { MockUserTokenService } from "../mocks/mock-user-token-service";
import { MockService } from "../mocks/mock-service";
import { createUserDto, createRegisterMemberDto, createRegisterProviderDto } from "../factories/auth.test.factory";
import { createMember } from "../factories/member.test.factory";
import { createProvider } from "../factories/provider.test.factory";
import { jwtConstants } from "../../src/auth/constants";
import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { createMemberToken, createPayload, createTokenPair } from "../factories/token.test.factory";
import * as nodemailer from 'nodemailer';
import * as nodemailerMock from 'nodemailer-mock';

describe('AuthService', () => {
    let authService: AuthService;
    let mockMemberTokensService: MockUserTokenService;
    let mockProviderTokensService: MockUserTokenService;
    let mockMemberService: MockService<Member>
    let mockProviderService: MockService<Provider>
    let mockTokensService: MockTokenService;

    beforeEach(async () => {
        mockMemberService = new MockService<Member>();
        mockProviderService = new MockService<Provider>();
        mockMemberTokensService = new MockUserTokenService();
        mockProviderTokensService = new MockUserTokenService();
        mockTokensService = new MockTokenService();

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                  provide: MembersService,
                  useValue: mockMemberService,
                },
                {
                    provide: ProvidersService,
                    useValue: mockProviderService,
                },
                {
                    provide: MemberTokensService,
                    useValue: mockMemberTokensService
                },
                {
                    provide: ProviderTokensService,
                    useValue: mockProviderTokensService
                },
                {
                    provide: TokenService,
                    useValue: mockTokensService
                },
                ConfigService,
            ]
        }).compile()
        authService = await module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(mockMemberService).toBeDefined();
        expect(mockProviderService).toBeDefined();
        expect(mockProviderTokensService).toBeDefined();
        expect(mockMemberTokensService).toBeDefined();
        expect(mockTokensService).toBeDefined();
        expect(authService).toBeDefined();
    });

    describe('findUserByEmail', () => {
        it('should find member with given email', async () => {
            const testMember = createMember({})
            const testUser = createUserDto({})
            mockMemberService.findOneByEmail.mockReturnValue(Promise.resolve(testMember))

            expect(await authService.findUserByEmail(testUser.email, testUser.type)).toEqual(testMember)
        })

        it('should find provider with given email', async () => {
            const testProvider = createProvider({})
            const testUser = createUserDto({type: 'provider'})
            mockProviderService.findOneByEmail.mockReturnValue(Promise.resolve(testProvider))

            expect(await authService.findUserByEmail(testUser.email, testUser.type)).toEqual(testProvider)
        })
    })

    describe('storeRefreshToken', () => {
        it('should store refresh token for member in database', async () => {
            const refreshToken = 'refreshToken'
            const testMember = createMember({})

            await authService.storeRefreshToken(refreshToken, 'member', testMember)
            expect(mockMemberTokensService.create).toHaveBeenCalledTimes(1)
            expect(mockMemberTokensService.create).toHaveBeenCalledWith(refreshToken, jwtConstants.refreshDefaultExpiration, testMember)
        })

        it('should store refresh token for provider in database', async () => {
            const refreshToken = 'refreshToken'
            const testProvider = createProvider({})

            await authService.storeRefreshToken(refreshToken, 'provider', testProvider)
            expect(mockProviderTokensService.create).toHaveBeenCalledTimes(1)
            expect(mockProviderTokensService.create).toHaveBeenCalledWith(refreshToken, jwtConstants.refreshDefaultExpiration, testProvider)
        })
    })

    describe('register', () => {
        it('should return member for successful registration', async () => {
            const registerAttempt = createRegisterMemberDto({})
            const testMember = createMember({})

            mockMemberService.create.mockReturnValue(testMember)

            expect(await authService.register(registerAttempt)).toEqual(testMember)
        })

        it('should return provider for successful registration', async () => {
            const registerAttempt = createRegisterProviderDto({})
            const testProvider = createProvider({})

            mockProviderService.create.mockReturnValue(testProvider)

            expect(await authService.register(registerAttempt)).toEqual(testProvider)
        })

        it('should throw a BadRequestException, if request body was malformed', async () => {
            const registerAttempt = createRegisterProviderDto({type: ''})

            expect.assertions(2);
            try {
                await authService.register(registerAttempt)
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect(e.message).toBe('Empty or malformed request body');
            }
        })
    })

    describe('login', () => {
        it('should store refresh token for member in database', async () => {
            const loginAttempt = createUserDto({})
            const testMember = createMember({})
            const testTokenPair = createTokenPair({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            mockTokensService.createToken.mockReturnValueOnce(testTokenPair.refreshToken)
            mockTokensService.createToken.mockReturnValueOnce(testTokenPair.accessToken)

            expect(await authService.login(loginAttempt)).toEqual(testTokenPair)
        })
    })

    describe('authenticateUserByJwt', () => {
        it('should find member with given payload', async () => {
            const testPayload = createPayload({})
            const testMember = createMember({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            await authService.authenticateUserByJwt(testPayload)
            expect(findUserByEmailSpy).toHaveBeenCalledTimes(1)
            expect(findUserByEmailSpy).toHaveBeenCalledWith(testPayload.email, testPayload.type)
        })
    })

    describe('logout', () => {
        it('should logout user', async () => {
            const testTokenPair = createTokenPair({})
            const testPayload = createPayload({})

            mockTokensService.verifyToken.mockReturnValue(testPayload)

            const result = await authService.logout(testTokenPair.accessToken, testTokenPair.refreshToken);
            expect(result).toEqual(HttpStatus.OK)
            expect(mockTokensService.deleteTokenInDB).toBeCalledWith(testPayload.type, testTokenPair.refreshToken)
        })
    })

    describe('getAccessTokenFromRefreshToken', () => {
        it('should get old refreshtoken from database and return token pair', async () => {
            const testTokenPair = createTokenPair({})
            const testUser = createUserDto({})
            const testMemberToken = createMemberToken({})

            mockTokensService.retrieveValidToken.mockReturnValue(Promise.resolve(testMemberToken))

            const renewTokenForUserSpy = jest.spyOn(authService, "renewTokenForUser")
            renewTokenForUserSpy.mockReturnValue(Promise.resolve(testTokenPair))

            const result = await authService.getAccessTokenFromRefreshToken(testTokenPair.refreshToken, testUser.email, testUser.type);
            expect(result).toEqual(testTokenPair)
        })
    })

    describe('renewTokenForUser', () => {
        it('should renew refreshToken in database and return accessToken and with new refreshToken', async () => {
            const testTokenPair = createTokenPair({})
            const testUser = createUserDto({})
            const testMemberToken = createMemberToken({})
            const testMember = createMember({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            mockTokensService.createToken.mockReturnValueOnce(testTokenPair.accessToken)
            mockTokensService.createToken.mockReturnValueOnce(testTokenPair.refreshToken)

            const storeRefreshTokenSpy = jest.spyOn(authService, "storeRefreshToken")

            const result = await authService.renewTokenForUser(testMemberToken, testUser.email, testUser.type);
            expect(result).toEqual(testTokenPair)
            expect(mockTokensService.deleteTokenInDB).toBeCalledWith(testUser.type, testMemberToken.token)
            expect(storeRefreshTokenSpy).toBeCalledWith(testTokenPair.refreshToken, testUser.type, testMember)
        })
    })

    describe('checkPasswordForUser', () => {
        it('should return true if the given (current) password does match the password in the database', async () => {
            const isCurrentPassword = true
            const testUser = createUserDto({})
            const testMember = createMember({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            const result = await authService.checkPasswordForUser(testUser.email, testUser.password, testUser.type, isCurrentPassword);
            expect(result).toBeTruthy()
        })

        it('should return true if the given (new) password does not match the (old) password in the database', async () => {
            const isCurrentPassword = false
            const testUser = createUserDto({})
            const testMember = createMember({checkPassword:false})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            const result = await authService.checkPasswordForUser(testUser.email, testUser.password, testUser.type, isCurrentPassword);
            expect(result).toBeTruthy()
        })

        it('should throw an exception if given (current) password does not match password in the database', async () => {
            const isCurrentPassword = true
            const testUser = createUserDto({})
            const testMember = createMember({checkPassword:false})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            expect.assertions(2);
            try {
                await authService.checkPasswordForUser(testUser.email, testUser.password, testUser.type, isCurrentPassword)
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException)
                expect(e.message).toBe('Wrong current password')
            }
        })

        it('should throw an exception if given (new) password does match (old) password in the database', async () => {
            const isCurrentPassword = false
            const testUser = createUserDto({})
            const testMember = createMember({checkPassword:true})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            expect.assertions(2);
            try {
                await authService.checkPasswordForUser(testUser.email, testUser.password, testUser.type, isCurrentPassword)
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException)
                expect(e.message).toBe('New password cannot be old password')
            }
        })
    })

    describe('updatePasswordForUser', () => {
        it('should update password for member', async () => {
            const testUser = createUserDto({})
            const testMember = createMember({})

            mockMemberService.setPassword.mockReturnValue(testMember)

            const result = await authService.updatePasswordForUser(testUser.email, testUser.password, testUser.type);
            expect(result).toEqual(testMember)
        })

        it('should update password for provider', async () => {
            const testUser = createUserDto({type: 'provider'})
            const testProvider = createProvider({})

            mockProviderService.setPassword.mockReturnValue(testProvider)

            const result = await authService.updatePasswordForUser(testUser.email, testUser.password, testUser.type);
            expect(result).toEqual(testProvider)
        })
    })

    describe('changePassword', () => {
        it('should change password if given passowords and token are valid ', async () => {
            const testPayload = createPayload({})
            const testUser = createUserDto({})
            const testMember = createMember({})

            const checkPasswordForUserSpy = jest.spyOn(authService, "checkPasswordForUser")
            checkPasswordForUserSpy.mockReturnValue(Promise.resolve(true))

            mockTokensService.verifyToken.mockReturnValueOnce(testPayload)

            const updatePasswordForUserSpy = jest.spyOn(authService, "updatePasswordForUser")
            updatePasswordForUserSpy.mockReturnValue(Promise.resolve(testMember))

            await authService.changePassword(testUser.email, testUser.password, testUser.password, 'token', testUser.type);
            expect(checkPasswordForUserSpy).toBeCalledTimes(2)
            expect(mockTokensService.verifyToken).toBeCalledTimes(1)
            expect(updatePasswordForUserSpy).toBeCalledTimes(1)
            expect(updatePasswordForUserSpy).toBeCalledWith(testUser.email, testUser.password, testUser.type)
        })
    })

    describe('resetPassword', () => {
        it('should reset password if there is a valid token stored in teh database and email and type provided in the token match the user object', async () => {
            const testPayload = createPayload({})
            const testUser = createUserDto({})
            const testMember = createMember({})
            const testMemberToken = createMemberToken({})

            mockTokensService.retrieveValidToken.mockReturnValue(Promise.resolve(testMemberToken))
            mockTokensService.verifyToken.mockReturnValue(testPayload)

            const checkPasswordForUserSpy = jest.spyOn(authService, "checkPasswordForUser")
            checkPasswordForUserSpy.mockReturnValue(Promise.resolve(true))

            const updatePasswordForUserSpy = jest.spyOn(authService, "updatePasswordForUser")
            updatePasswordForUserSpy.mockReturnValue(Promise.resolve(testMember))

            await authService.resetPassword(testUser.email, testUser.password, testUser.password, testUser.type);
            expect(mockTokensService.retrieveValidToken).toBeCalledTimes(1)
            expect(mockTokensService.verifyToken).toBeCalledTimes(1)
            expect(checkPasswordForUserSpy).toBeCalledTimes(1)
            expect(updatePasswordForUserSpy).toBeCalledTimes(1)
            expect(updatePasswordForUserSpy).toBeCalledWith(testUser.email, testUser.password, testUser.type)
            expect(mockTokensService.deleteTokenInDB).toBeCalledTimes(1)
            expect(mockTokensService.deleteTokenInDB).toBeCalledWith(testUser.type, testMemberToken.token)
        })

        it('should throw an exception if the given emails do not match', async () => {
            const testPayload = createPayload({email: ''})
            const testUser = createUserDto({})
            const testMemberToken = createMemberToken({})

            mockTokensService.retrieveValidToken.mockReturnValue(Promise.resolve(testMemberToken))
            mockTokensService.verifyToken.mockReturnValue(testPayload)

            expect.assertions(2);
            try {
                await authService.resetPassword(testUser.email, testUser.password, testUser.password, testUser.type);
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException)
                expect(e.message).toBe('Malformed request body: Email does not match')
            }
        })
    })

    describe('sendEmailForgotPassword', () => {
        it('should successfully send email', async () => {
            const testUser = createUserDto({})
            const testMember = createMember({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            mockTokensService.createForgottenPasswordToken.mockReturnValue(Promise.resolve('token'))

            nodemailerMock.mock.shouldFail(false)
            const transport = nodemailerMock.createTransport({});

            const nodemailerSpy = jest.spyOn(nodemailer, "createTransport")
            nodemailerSpy.mockReturnValue(transport)

            await authService.sendEmailForgotPassword(testUser.email, testUser.type);
            expect(nodemailerSpy).toHaveBeenCalledTimes(1)
        })

        it('should fail sending mail and throw an exception', async () => {
            const testUser = createUserDto({})
            const testMember = createMember({})

            const findUserByEmailSpy = jest.spyOn(authService, "findUserByEmail")
            findUserByEmailSpy.mockReturnValue(Promise.resolve(testMember))

            mockTokensService.createForgottenPasswordToken.mockReturnValue(Promise.resolve('token'))

            nodemailerMock.mock.shouldFail(true)
            const transport = nodemailerMock.createTransport({});

            const nodemailerSpy = jest.spyOn(nodemailer, "createTransport")
            nodemailerSpy.mockReturnValue(transport)

           expect.assertions(3);
            try {
                await authService.sendEmailForgotPassword(testUser.email, testUser.type);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('An error occurred when sending the email');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST)
            }
        })
    })
})
