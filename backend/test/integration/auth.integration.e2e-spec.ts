import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest'
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { TokenService } from '../../src/auth/token.service';
import { createUserDto } from '../factories/auth.test.factory';
import { MembersService } from '../../src/members/members.service';
import { Member } from '../../src/members/member.entity';
import { ProvidersService } from '../../src/providers/providers.service';
import { MemberTokensService } from '../../src/member-tokens/member-tokens.service';
import { ProviderTokensService } from '../../src/provider-tokens/provider-tokens.service';
import { ConfigService } from '@nestjs/config';
import { createMember } from '../factories/member.test.factory';
import { MockJwtService } from '../mocks/mock-jwt.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/mock-repo';
import { MemberImageService } from '../../src/images/member-image.service';
import { MemberImage } from '../../src/images/member-image.entity';
import { Provider} from '../../src/providers/provider.entity';
import { ProviderImagesService } from '../../src/images/provider-images.service';
import { ProviderImages } from '../../src/images/provider-images.entity';
import { CoursesService } from '../../src/courses/courses.service';
import { Course } from '../../src/courses/course.entity';
import { CourseImagesService } from '../../src/images/course-images.service';
import { CourseImages } from '../../src/images/course-images.entity';
import { MemberToken } from '../../src/member-tokens/member-token.entity';
import { ProviderToken } from '../../src/provider-tokens/provider-token.entity';
import { createMemberToken, createPayload, createTokenPair } from '../factories/token.test.factory';
import * as cookieParser from 'cookie-parser';

describe('Course integration test', () => {
    let app: INestApplication;
    let authController: AuthController;

    let mockJwtService: MockJwtService;
    let mockMemberRepository: MockRepository<Member>;
    let mockMemberImageRepository: MockRepository<MemberImage>;
    let mockProviderRepository: MockRepository<Provider>;
    let mockProviderImagesRepository: MockRepository<ProviderImages>;
    let mockCourseRepository: MockRepository<Course>;
    let mockCourseImagesRepository: MockRepository<CourseImages>;
    let mockMemberTokenRepository: MockRepository<MemberToken>;
    let mockProviderTokenRepository: MockRepository<ProviderToken>;
    let testTokenPair;
    let testMember;

    beforeEach(async () => {
        mockJwtService = new MockJwtService();
        mockMemberRepository = new MockRepository<Member>();
        mockMemberImageRepository = new MockRepository<MemberImage>();
        mockProviderRepository = new MockRepository<Provider>();
        mockProviderImagesRepository = new MockRepository<ProviderImages>();
        mockCourseRepository = new MockRepository<Course>();
        mockCourseImagesRepository = new MockRepository<CourseImages>();
        mockMemberTokenRepository = new MockRepository<MemberToken>()
        mockProviderTokenRepository = new MockRepository<ProviderToken>()

        testTokenPair = createTokenPair({})
        const testPayload = createPayload({})
        mockJwtService.verify.mockReturnValue(testPayload)

        testMember = createMember({})
        mockMemberRepository.create.mockReturnValue(Promise.resolve(testMember))
        mockMemberRepository.save.mockReturnValue(Promise.resolve(testMember))
        mockMemberRepository.findOneOrFail.mockReturnValue(Promise.resolve(testMember))
        mockMemberRepository.findOne.mockReturnValue(Promise.resolve(undefined))

        const testMemberToken = createMemberToken({})
        mockMemberTokenRepository.findOneOrFail.mockReturnValue(Promise.resolve(testMemberToken))
        mockMemberTokenRepository.findOne.mockReturnValue(Promise.resolve(undefined))
        mockMemberTokenRepository.create.mockReturnValue(Promise.resolve(testMemberToken))
        mockMemberTokenRepository.save.mockReturnValue(Promise.resolve(testMemberToken))
        mockMemberTokenRepository.delete.mockReturnValue(Promise.resolve(testMemberToken))

        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                TokenService,
                ConfigService,
                JwtService,
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                MembersService,
                {
                    provide: getRepositoryToken(Member),
                    useValue: mockMemberRepository
                },
                MemberImageService,
                {
                    provide: getRepositoryToken(MemberImage),
                    useValue: mockMemberImageRepository
                },
                ProvidersService,
                {
                    provide: getRepositoryToken(Provider),
                    useValue: mockProviderRepository
                },
                ProviderImagesService,
                {
                    provide: getRepositoryToken(ProviderImages),
                    useValue: mockProviderImagesRepository
                },
                CoursesService,
                {
                    provide: getRepositoryToken(Course),
                    useValue: mockCourseRepository
                },
                CourseImagesService,
                {
                    provide: getRepositoryToken(CourseImages),
                    useValue: mockCourseImagesRepository
                },
                MemberTokensService,
                {
                    provide: getRepositoryToken(MemberToken),
                    useValue: mockMemberTokenRepository
                },
                ProviderTokensService,
                {
                    provide: getRepositoryToken(ProviderToken),
                    useValue: mockProviderTokenRepository
                }
            ]
        })
        .compile();
        authController = module.get<AuthController>(AuthController)
        app = module.createNestApplication();
        app.use(cookieParser());
        await app.init();
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
        expect(app).toBeDefined();
    });

    describe('GET /access_token', () => {
        it('should set new refreshToken cookie and return new accessToken', async () => {
            mockJwtService.sign.mockReturnValueOnce(testTokenPair.accessToken)
            mockJwtService.sign.mockReturnValueOnce(testTokenPair.refreshToken)

            const response = await request(app.getHttpServer())
            .get('/access_token')
            .set('Authorization', 'bearer ' + testTokenPair.accessToken)
            .set('Cookie', ['refreshToken=refreshToken'])
            .set('Content-Type', 'application/json')
            .send()
            expect(response.status).toEqual(HttpStatus.OK)
            expect(response.header).toHaveProperty('set-cookie')
            expect(response.header['set-cookie']).toEqual(["refreshToken =refreshToken; HttpOnly"])
            expect(response.body).toEqual({accessToken: testTokenPair.accessToken})
        })

        it('should return a NotFound response if no refreshToken was provided in the cookies', async () => {
            const response = await request(app.getHttpServer())
            .get('/access_token')
            .set('Authorization', 'bearer ' + testTokenPair.accessToken)
            expect(response.status).toEqual(HttpStatus.NOT_FOUND)
            expect(response.body.statusCode).toEqual(HttpStatus.NOT_FOUND)
            expect(response.body.message).toEqual('No refresh token has been provided')
        })
    })

    describe('POST /login', () => {
        it('should return accessToken if login was successful', async () => {
            mockJwtService.sign.mockReturnValueOnce('refreshToken')
            mockJwtService.sign.mockReturnValueOnce('accessToken')

            const response = await request(app.getHttpServer())
            .post('/login')
            .send({...createUserDto({})})
            expect(response.status).toEqual(HttpStatus.CREATED)
            expect(response.body).toEqual({accessToken: 'accessToken'})
        })

        it('should return an Unauthorized response if given password does not match user password', async () => {
            testMember = createMember({checkPassword: false})
            mockMemberRepository.findOneOrFail.mockReturnValue(Promise.resolve(testMember))

            const response = await request(app.getHttpServer())
            .post('/login')
            .send(createUserDto({}))
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body.statusCode).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body.message).toEqual('This email, password combination was not found')
        })

        it('should return an Unauthorized response if token creation fails', async () => {
            testMember = createMember({checkPassword: false})
            mockMemberRepository.findOneOrFail.mockReturnValue(Promise.resolve(testMember))
            mockJwtService.sign.mockReturnValue(null)

            const response = await request(app.getHttpServer())
            .post('/login')
            .send(createUserDto({}))
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body.statusCode).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body.message).toEqual('This email, password combination was not found')
        })
    })

    describe('POST /register', () => {
        it('should return success response if register was successful', async () => {
            const response = await request(app.getHttpServer())
            .post('/register')
            .send(createUserDto({}))
            expect(response.status).toEqual(HttpStatus.CREATED)
            expect(response.body.statusCode).toEqual(HttpStatus.CREATED)
            expect(response.body.message).toEqual('User has been registered successfully')
        })
    })

    describe('POST /logout', () => {
        it('should return success response if logout was successful', async () => {
            const response = await request(app.getHttpServer())
            .post('/logout')
            .set('Authorization', 'bearer ' + testTokenPair.accessToken)
            .set('Cookie', ['refreshToken=refreshToken'])
            .set('Content-Type', 'application/json')
            .send()
            expect(response.status).toEqual(HttpStatus.OK)
            expect(response.body.statusCode).toEqual(HttpStatus.OK)
            expect(response.body.message).toEqual('User got logged out successfully')
        })
    })

    afterAll(async () => {
        await app.close();
    });
})
