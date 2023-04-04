import {MockRepository} from "../mocks/mock-repo";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {HttpException, HttpStatus} from "@nestjs/common";
import {createFileOptions, createGenerateTestFileparams, createGetParamsForAws} from "../factories/aws.test.factory";
import {Aws} from "../../src/config/aws";
import {CourseImagesService} from "../../src/images/course-images.service";
import {CourseImages} from "../../src/images/course-images.entity";
import {createCourseImage} from "../factories/images.test.factory";
import {createCourse} from "../factories/course.test.factory";

describe('CourseImagesService', () => {
    let courseImagesService: CourseImagesService;
    let mockCourseImagesRepository: MockRepository<CourseImages>;

    beforeEach(async () => {
        mockCourseImagesRepository = new MockRepository<CourseImages>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [CourseImagesService,
                {
                    provide: getRepositoryToken(CourseImages),
                    useValue: mockCourseImagesRepository
                }
            ],
        }).compile();

        courseImagesService = module.get<CourseImagesService>(CourseImagesService);
    });

    it('should be defined', () => {
        expect(courseImagesService).toBeDefined();
    });

    describe('findOneById', () => {
        it('should return a course image object', async () => {
            const courseImage = createCourseImage({});
            mockCourseImagesRepository.findOneOrFail.mockReturnValue(Promise.resolve(courseImage));
            expect(await courseImagesService.findOneById(courseImage.id)).toEqual(courseImage);
        });

        it('should throw an exception when no course image with that id was found', async () => {
            expect.assertions(3);
            mockCourseImagesRepository.findOneOrFail.mockImplementation(() => {
                throw "findOneOrFail fails";
            });
            try {
                await courseImagesService.findOneById(0);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Image not found');
                expect(e.status).toBe(HttpStatus.NOT_FOUND);
            }
        });
    });

    describe('create', () => {
        it('should return the saved course image', async () => {
            const image = createCourseImage({}),
                course = createCourse({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));

            mockCourseImagesRepository.save.mockReturnValue(Promise.resolve(image));

            expect(await courseImagesService.create(course, file)).toEqual(image);
            expect(awsUploadFileToS3Spy).toBeCalledWith(file, course.id, 'courses');
            expect(mockCourseImagesRepository.create).toBeCalledTimes(1);
            expect(mockCourseImagesRepository.save).toBeCalledTimes(1);
        });

        it('should throw an BadRequest Exception if image can not be saved', async () => {
            expect.assertions(3);
            const course = createCourse({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockCourseImagesRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await courseImagesService.create(course, file);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                expect(e.message).toBe('Could not save image');
            }
        });

        it('should delete image from aws if image can not be saved', async () => {
            expect.assertions(1);
            const course = createCourse({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockCourseImagesRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await courseImagesService.create(course, file);
            } catch (e) {
                expect(awsDeleteFileFromAwsSpy).toBeCalledWith(fileparams.params);
            }
        });
    });

    describe('update', () => {
        it('should return a course image object', async () => {
            const image = createCourseImage({}),
                course = createCourse({profileImage: image});

            mockCourseImagesRepository.save.mockReturnValue(Promise.resolve(image));
            expect(await courseImagesService.update(course, image)).toEqual(image);
        });

        it('should throw an exception when image could not be updated', async () => {
            expect.assertions(3);
            const image = createCourseImage({}),
                course = createCourse({profileImage: image});

            mockCourseImagesRepository.save.mockImplementation(() => {
                throw "save fails";
            });

            try {
                await courseImagesService.update(course, image);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not update profile image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });

    describe('delete', () => {
        it('should return the deleted course image object', async () => {
            const image = createCourseImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockCourseImagesRepository.delete.mockReturnValue(Promise.resolve(image));
            expect(await courseImagesService.delete(image)).toEqual(image);
            expect(awsGetParamsForAwsSpy).toBeCalledWith(image);
            expect(awsDeleteFileFromAwsSpy).toBeCalledWith(params);
        });


        it('should throw an exception when image could not be deleted', async () => {
            expect.assertions(3);
            const image = createCourseImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockCourseImagesRepository.delete.mockImplementation(() => {
                throw "delete fails";
            });
            try {
                await courseImagesService.delete(image);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not delete image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });
});
