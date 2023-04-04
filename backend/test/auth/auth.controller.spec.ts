import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../src/auth/auth.controller";
import { TokenService } from "../../src/auth/token.service";
import { AuthService } from "../../src/auth/auth.service";
import { MockAuthService } from "../mocks/mock-auth-service";
import { MockTokenService } from "../mocks/mock-token-service";
import * as httpMocks from "node-mocks-http"
import { createMemberDto} from "../factories/member.test.factory";
import {
    createEmailTypeObject,
    createResetPasswordDto,
    createUserDto
} from "../factories/auth.test.factory";
import {createTokenPair} from "../factories/token.test.factory"; 

describe('Auth Controller', () => {
    let authController: AuthController;
    let mockAuthService: MockAuthService;
    let mockTokenService: MockTokenService;

    beforeEach(async () => {
        mockTokenService = new MockTokenService();
        mockAuthService = new MockAuthService();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService, {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                TokenService,
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
            ]
        })
        .compile();
        authController = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(mockTokenService).toBeDefined();
        expect(mockAuthService).toBeDefined();
        expect(authController).toBeDefined();
    });

    describe('token', () => {
        it('should throw an exception if no refreshToken is provided', async () => {
            const mockRequest = httpMocks.createRequest()
            const mockResponse = httpMocks.createResponse()
            expect.assertions(3);
            try {
                await authController.token(mockRequest, mockResponse);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('No refresh token has been provided');
                expect(e.status).toBe(HttpStatus.NOT_FOUND);
            }
        });

        it('should set refresh cookie and return new accessToken on success', async () => {
            mockTokenService.extractTokenFromHeaders.mockReturnValue("token")
            mockTokenService.verifyToken.mockReturnValue(createEmailTypeObject({}))
            mockAuthService.getAccessTokenFromRefreshToken.mockReturnValue(Promise.resolve(createTokenPair({})))

            const mockResponse = httpMocks.createResponse()
            const mockRequest = httpMocks.createRequest()
            mockRequest.cookies.refreshToken = 'refreshToken'

            await authController.token(mockRequest, mockResponse);

            expect(mockResponse._getHeaders()["set-cookie"]).toBe('refreshToken =refreshToken; HttpOnly')
            expect(mockResponse._getData().accessToken).toBe("accessToken")
        })
    });

    describe('login', ()=> {
        it('should throw an error, if email password combo is wrong', async () => {
            const mockResponse = httpMocks.createResponse()
            const testUser = createUserDto({})
            mockAuthService.login.mockReturnValue(undefined);

            expect.assertions(3);
            try {
                await authController.login(testUser, mockResponse);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('This email, password combination was not found');
                expect(e.status).toBe(HttpStatus.UNAUTHORIZED);
            }
        })

        it('should set refresh cookie and return new accessToken on success', async () => {
            const testUser = createUserDto({})
            const mockResponse = httpMocks.createResponse()

            mockAuthService.login.mockReturnValue(Promise.resolve(createTokenPair({})))
            await authController.login(testUser, mockResponse)

            expect(mockAuthService.login).toBeCalledTimes(1)
            expect(mockResponse._getHeaders()["set-cookie"]).toBe('refreshToken =refreshToken; HttpOnly')
            expect(mockResponse._getData().accessToken).toBe("accessToken")
        })
    })

    describe('register', ()=> {
        it('should return status created on success', async () => {
            const testMember = createMemberDto({})
            const response = await authController.register(testMember)
            expect(response.statusCode).toBe(HttpStatus.CREATED);
            expect(response.message).toBe('User has been registered successfully')
        })
    })

    describe('logout', ()=> {
        it('should throw BadRequestException if not called with refreshToken set in cookies', async () => {
            const mockRequest = httpMocks.createRequest()

            expect.assertions(2);
            try {
                await authController.logout(mockRequest);
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect(e.message).toBe('No refresh token has been provided');
            }
        })

        it('should return success message on success', async () => {
            const mockRequest = httpMocks.createRequest();
            mockRequest.cookies.refreshToken = 'refreshToken'
            mockAuthService.logout.mockReturnValue(HttpStatus.OK);
            const response = await authController.logout(mockRequest);
            expect(response.statusCode).toBe(HttpStatus.OK)
            expect(response.message).toBe('User got logged out successfully')
        })
    })

    describe('forgot-password', () => {
        it('should return success status on success', async () => {
            const mockRequest = httpMocks.createRequest();
            mockRequest.body = createEmailTypeObject({})
            mockAuthService.sendEmailForgotPassword.mockReturnValue(Promise.resolve(true))

            const response = await authController.sendEmailForgotPassword(mockRequest)
            expect(response.statusCode).toBe(HttpStatus.OK)
            expect(response.message).toBe('Email sent successfully')
        })
    })

    describe('reset-password', () => {
        it('should throw an exception for malformed request body', async () => {
            const testPasswordDto = createResetPasswordDto({})
            testPasswordDto.email = null;
            const mockRequest = httpMocks.createRequest();

            expect.assertions(3);
            try {
                await authController.setNewPassword(testPasswordDto, mockRequest);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Password could not be changed. Malformed request body');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        })

        it('should call changepassword and update password successfully', async () => {
            const mockRequest = httpMocks.createRequest();
            const testPasswordDto = createResetPasswordDto({})
            testPasswordDto.newPasswordToken = null;

            mockTokenService.extractTokenFromHeaders.mockReturnValue('sometoken')
            mockAuthService.changePassword.mockReturnValue(Promise.resolve())
           
            const response = await authController.setNewPassword(testPasswordDto, mockRequest)
            expect(mockAuthService.changePassword).toBeCalledTimes(1)
            expect(response.message).toBe('Password got updated successfully');
            expect(response.statusCode).toBe(HttpStatus.OK);
        })

        it('should call resetPassword and reset password successfully', async () => {
            const mockRequest = httpMocks.createRequest();
            const testPasswordDto = createResetPasswordDto({})
            testPasswordDto.currentPassword = null;

            mockTokenService.extractTokenFromHeaders.mockReturnValue('sometoken')
            mockAuthService.resetPassword.mockReturnValue(Promise.resolve())
           
            const response = await authController.setNewPassword(testPasswordDto, mockRequest)
            expect(mockAuthService.resetPassword).toBeCalledTimes(1)
            expect(response.message).toBe('Password got updated successfully');
            expect(response.statusCode).toBe(HttpStatus.OK);
        })
    })
});
