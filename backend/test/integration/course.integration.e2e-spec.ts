import { Test } from '@nestjs/testing';
import { createProvider, createProviderRepo, createProviderResponse } from '../factories/provider.test.factory';
import { CanActivate, HttpStatus, INestApplication } from '@nestjs/common';
import { Course } from '../../src/courses/course.entity';
import { CoursesService } from '../../src/courses/courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/mock-repo';
import { CourseImages } from '../../src/images/course-images.entity';
import { CourseImagesService } from '../../src/images/course-images.service';
import { createCourse, createCourseRepo, createCourseResponse as createCourseResponse } from '../factories/course.test.factory';
import { CoursesController } from '../../src/courses/courses.controller';
import * as request from 'supertest'
import { AuthGuardUser } from '../../src/auth/AuthGuardUser';
import { AuthGuard } from '@nestjs/passport';
import { RolesCourseGuard } from '../../src/auth/roles/rolesCourse.guard';
import { createCourseImageRepo } from '../factories/images.test.factory';
import { createSuccessResponse } from '../factories/response.test.factory';
import { createGenerateTestFileparams } from '../factories/aws.test.factory';
import { Aws } from '../../src/config/aws';


describe('Course integration test', () => {
    let app: INestApplication;

    let courseController: CoursesController;
    let mockCourseRepository: MockRepository<Course>;
    let mockCourseImagesRepository: MockRepository<CourseImages>;
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
    let testCourse;
    let testCourseImage;

    beforeEach(async () => {
        mockCourseRepository = new MockRepository<Course>();
        mockCourseRepository.findOneOrFail.mockReturnValue(Promise.resolve(testCourse));
        mockCourseRepository.save.mockReturnValue(Promise.resolve(testCourse))
        mockCourseRepository.delete.mockReturnValue(Promise.resolve(testCourse))

        mockCourseImagesRepository = new MockRepository<CourseImages>();
        mockCourseImagesRepository.findOneOrFail.mockReturnValue(Promise.resolve(testCourseImage));
        mockCourseImagesRepository.save.mockReturnValue(Promise.resolve(testCourseImage));
        mockCourseImagesRepository.create.mockReturnValue(Promise.resolve(testCourseImage));
        mockCourseImagesRepository.delete.mockReturnValue(Promise.resolve(testCourseImage))

        testCourse = createCourseRepo({isPublished: true, provider: createProviderRepo({isPublished: true})})
        testCourseImage = createCourseImageRepo({course: testCourse, profileImage: testCourse})

        const module = await Test.createTestingModule({
        controllers: [CoursesController],
        providers: [
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
        ]
        })
        .overrideGuard(AuthGuardUser).useValue(mockGuard)
        .overrideGuard(AuthGuard('jwt')).useValue(mockGuard)
        .overrideGuard(RolesCourseGuard).useValue(mockGuard)
        .compile();
        courseController = module.get<CoursesController>(CoursesController)
        app = module.createNestApplication();
        await app.init();
    });

    it('should be defined', () => {
        expect(courseController).toBeDefined();
        expect(app).toBeDefined();
    });

    describe('GET /id', () => {
        it('should return single public course', async () => {
            const response = await request(app.getHttpServer())
            .get(`/${testCourse.id}`)
            expect(response.status).toBe(200)
            expect(response.body).toEqual(testCourse)
        })
    })

    describe('GET /', () => {
        it('should return array of public courses', async () => {
            const testCoursesMock = [
                createCourse({id: 1, isPublished: true, provider: createProvider({isPublished: true})}),
                createCourse({id: 2, isPublished: true,  provider: createProvider({isPublished: true})}),
            ]

            const testCoursesResponse = [
                createCourseResponse({id: 1, isPublished: true, provider: createProviderResponse({isPublished: true})}),
                createCourseResponse({id: 2, isPublished: true,  provider: createProviderResponse({isPublished: true})}),
            ]

            const spy = jest.spyOn(courseController.base, "getManyBase");
            spy.mockReturnValue(Promise.resolve(testCoursesMock))

            const response = await request(app.getHttpServer())
            .get('/')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(testCoursesResponse)
        })
    })

    describe('PATCH /id', () => {
        it('should update a single course', async () => {
            const response = await request(app.getHttpServer())
            .patch(`/${testCourse.id}`)
            .send()
            expect(response.status).toBe(200)
            expect(response.body).toMatchObject(testCourse)
        })
    })

    describe('DELETE /id', () => {
        it('should return success response after deleting a single course', async () => {
            const response = await request(app.getHttpServer())
            .delete(`/${testCourse.id}`)
            expect(response.status).toBe(200)
            expect(response.body).toEqual(createSuccessResponse({message: 'Course profile got deleted successfully'}))
        })

        it('should return a BadRequest response if deleting was not possible', async () => {
            mockCourseRepository.delete.mockImplementation(() => {
                throw 'something'
            })

            const response = await request(app.getHttpServer())
            .delete(`/${testCourse.id}`)
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.message).toEqual('Could not delete course')
        })
    })

    describe('POST /id/image', () => {
        it('should return course image after uploading image successfully', async () => {
            const fileparams = createGenerateTestFileparams({});
            const awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");
            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));

            const buffer = Buffer.from('a buffer')
            const response = await request(app.getHttpServer())
            .post(`/${testCourse.id}/image`)
            .set('Accept', 'multipart/form-data')
            .attach('image', buffer, 'Test.JPG');
            expect(response.status).toBe(201)
            expect(response.body).toMatchObject(testCourseImage)
        })

        it('should return a BadRequest response if no file was submitted', async () => {
            const response = await request(app.getHttpServer())
            .post(`/${testCourse.id}/image`)
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.message).toEqual('No file submitted')
        })
    })

    describe('PATCH /id/image/imageId', () => {
        it('should return course image if setting a new profile image for course was successful', async () => {
            const response = await request(app.getHttpServer())
            .patch(`/${testCourse.id}/images/${testCourseImage.id}`)
            .send()
            expect(response.status).toEqual(200)
            expect(response.body).toEqual(testCourseImage)
            expect(testCourseImage.profileImage).toEqual(testCourse)
        })

        it('should return a BadRequest response if unable to update profile image for course', async () => {
            mockCourseImagesRepository.save.mockImplementation(() => {
                throw 'could not save'
            })

            const response = await request(app.getHttpServer())
            .patch(`/${testCourse.id}/images/${testCourseImage.id}`)
            .send()
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body.message).toEqual('Could not update profile image')
        })
    })

    describe('DELETE /id/images/imageId', () => {
        it('should return success response after deleting image for course', async () => {
            testCourse = createCourseRepo({profileImage: createCourseImageRepo({})})
            testCourseImage = createCourseImageRepo({profileImage: testCourse, course: testCourse})

            const awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            const successMessage = createSuccessResponse({message: 'Image got deleted successfully'})
            const response = await request(app.getHttpServer())
            .delete(`/${testCourse.id}/images/${testCourseImage.id}`)
            expect(response.body).toEqual(successMessage)
        })

        it('should return a BadRequest response if course has no images', async () => {
            mockCourseImagesRepository.findOneOrFail.mockImplementation(() => {
                throw 'fails'
            })

            const response = await request(app.getHttpServer())
            .delete(`/${testCourse.id}/images/${testCourseImage.id}`)
            expect(response.status).toEqual(HttpStatus.NOT_FOUND)
            expect(response.body.statusCode).toEqual(HttpStatus.NOT_FOUND)
            expect(response.body.message).toEqual('Image not found')
        })
    })

    afterAll(async () => {
        await app.close();
    });
})
