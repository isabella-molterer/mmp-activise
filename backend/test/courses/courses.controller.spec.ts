import { Test, TestingModule } from '@nestjs/testing';
import {HttpException, HttpStatus, UnauthorizedException} from '@nestjs/common';
import { Course } from '../../src/courses/course.entity';
import { CoursesService } from '../../src/courses/courses.service';
import { CourseImagesService } from '../../src/images/course-images.service';
import { CoursesController } from '../../src/courses/courses.controller';
import {MockService} from "../mocks/mock-service";
import {CourseImage} from "../../../frontend/src/models/CourseImage";
import {createFileOptions} from "../factories/aws.test.factory";
import {createCourseImage} from "../factories/images.test.factory";
import {createCourse, createCourseDto} from "../factories/course.test.factory";
import * as jwt from "jsonwebtoken";
import {CrudRequest} from "@nestjsx/crud";
import {createProvider} from "../factories/provider.test.factory";
import {createPayload} from "../factories/token.test.factory";

describe('Courses Controller', () => {
  let coursesController: CoursesController;
  let mockCourseService: MockService<Course>
  let mockCourseImagesService: MockService<CourseImage>

  beforeEach(async () => {
    mockCourseService = new MockService<Course>();
    mockCourseImagesService = new MockService<CourseImage>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        CoursesService,
        {
          provide: CoursesService,
          useValue: mockCourseService,
        },
        CourseImagesService,
        {
          provide: CourseImagesService,
          useValue: mockCourseImagesService,
        }
      ],
    })
        .compile();

    coursesController = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(mockCourseService).toBeDefined();
    expect(mockCourseImagesService).toBeDefined();
    expect(coursesController).toBeDefined();
  });

  describe('base', () => {
    it('should return providerController', async () => {
      expect(coursesController.base).toEqual(coursesController)
    });
  });

  describe('getMany', () => {
    it('should return array of courses', async () => {
      const courses = [createCourse({}), createCourse({})],
          req: CrudRequest = {options: null, parsed: null},
          getManyBaseSpy = jest.spyOn(coursesController.base, "getManyBase");
      getManyBaseSpy.mockReturnValue(Promise.resolve(courses));

      expect(await coursesController.getMany(req)).toEqual(courses);
      expect(getManyBaseSpy).toBeCalledWith(req);
    });
  });

  describe('createOne', () => {
    it('should be called with req and dto', async () => {
      const course = createCourse({}),
          req = {options: null, parsed: null},
          createOneBaseSpy = jest.spyOn(coursesController.base, "createOneBase");
      createOneBaseSpy.mockReturnValue(Promise.resolve(course));
      expect(await coursesController.createOne(req, course)).toEqual(course);
      expect(createOneBaseSpy).toBeCalledWith(req, course);
    });
  });

  describe('getOne', () => {
    it('should return requested course, when course and provider is published', async () => {
      const course = createCourse({}),
          req: CrudRequest = {options: null, parsed: null},
          extractBearerToken = jest.fn(() => null);
      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));

      expect(await coursesController.getOne({}, course.id, req, extractBearerToken)).toEqual(course);
      expect(extractBearerToken).toBeCalledWith(req);
      expect(mockCourseService.findOneById).toBeCalledWith(course.id, {relations: ["provider", 'courseDates','profileImage', 'slideShow']})
    });

    it('should return requested course, when course is not published but provider is logged in', async () => {
      const course = createCourse({isPublished: false}),
          provider = createProvider({}),
          req = {},
          jestSpy = jest.spyOn(jwt, "decode"),
          payload = createPayload({type: "provider"}),
          tokenString = 'tokenString';

      const extractBearerToken = jest.fn(() => tokenString);

      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));
      jestSpy.mockReturnValue(payload);

      expect(await coursesController.getOne(provider, course.id, req, extractBearerToken)).toEqual(course);
      expect(jestSpy).toBeCalledTimes(1);
      expect(jestSpy).toBeCalledWith(tokenString)
    });

    it('should throw unauthorized error when requested course is not published and provider is not logged in', async () => {
      const course = createCourse({isPublished: false}),
          req: CrudRequest = {options: null, parsed: null},
          extractBearerToken = jest.fn(() => null);
      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));

      expect.assertions(3);

      try {
        await coursesController.getOne({}, course.id, req, extractBearerToken)
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Missing access permission rights');
        expect(e.status).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw unauthorized error when requested course is not published and wrong provider is logged in', async () => {
      const course = createCourse({isPublished: false}),
          provider = createProvider({id: 2}),
          req: CrudRequest = {options: null, parsed: null},
          extractBearerToken = jest.fn(() => null),
          jestSpy = jest.spyOn(jwt, "decode"),
          payload = createPayload({type: "provider"});

      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));
      jestSpy.mockReturnValue(payload);

      expect.assertions(4);

      try {
        await coursesController.getOne(provider, course.id, req, extractBearerToken)
      } catch (e) {
        expect(jestSpy).toBeCalledTimes(1);
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Missing access permission rights');
        expect(e.status).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw unauthorized error when requested course is published but provider is not and provider is not logged in', async () => {
      const course = createCourse({isPublished: true, provider: createProvider({isPublished: false})}),
          req: CrudRequest = {options: null, parsed: null},
          extractBearerToken = jest.fn(() => null);
      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));

      expect.assertions(3);

      try {
        await coursesController.getOne({}, course.id, req, extractBearerToken)
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Missing access permission rights');
        expect(e.status).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });


  describe('update', function () {
    it('should return updated course object', async () => {
      const course = createCourse({}),
          courseDto = createCourseDto({});
      mockCourseService.update.mockReturnValue(course);

      expect(await coursesController.update(course.id, courseDto)).toEqual(course);
      expect(mockCourseService.update).toBeCalledWith(course.id, courseDto)
    });
  });

  describe('deleteOne', () => {
    it('should return success message when course was successfully deleted from db', async () => {
      mockCourseService.deleteOneById(Promise.resolve());
      const result = await coursesController.deleteOne(1);
      expect(result.statusCode).toEqual(200);
      expect(result.message).toEqual('Course profile got deleted successfully');
    });
  });

  describe('uploadImage', () => {
    it('should return courseImage object when file was submitted', async () => {
      const file = createFileOptions({}),
          course = createCourse({}),
          courseImage = createCourseImage({});

      mockCourseService.findOneById.mockReturnValue(Promise.resolve(course));
      mockCourseImagesService.create.mockReturnValue(Promise.resolve(courseImage));

      expect(await coursesController.uploadImage(course.id, file)).toEqual(courseImage);
    });

    it('should throw exception if no file was provided', async () => {
      expect.assertions(3);
      const file = null,
          course = createCourse({});
      try {
        await coursesController.uploadImage(course.id, file)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('No file submitted');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

 describe('updateImage', () => {

    it('should return updated profile image', async () => {
      const course = createCourse({}),
          courseImage = createCourseImage({});

      mockCourseService.findOneById.mockReturnValue(course);
      mockCourseImagesService.findOneById.mockReturnValue(courseImage);
      mockCourseImagesService.update.mockReturnValue(courseImage);

      expect(await coursesController.setProfileImage(course.id, courseImage.id)).toEqual(courseImage);
      expect(mockCourseService.findOneById).toBeCalledWith(course.id,{relations: ["profileImage"]});
      expect(mockCourseImagesService.findOneById).toBeCalledWith(courseImage.id, {relations: ["course"]});
      expect(mockCourseImagesService.update).toBeCalledWith(course, courseImage);
    });
  });

  describe('deleteImageFromSlideshow', () => {

    it('should return success message when deleting the image from slideshow', async () => {
      const courseImage = createCourseImage({}),
          course = createCourse({profileImage: courseImage});

      mockCourseImagesService.findOneById.mockReturnValue(courseImage);
      mockCourseImagesService.delete.mockReturnValue(courseImage);
      mockCourseService.findOneById.mockReturnValue(course);

      const result = await coursesController.deleteImageFromSlideshow(course.id, courseImage.id);
      expect(result.statusCode).toEqual(200);
      expect(result.message).toEqual('Image got deleted successfully');
      expect(mockCourseImagesService.delete).toBeCalledWith(courseImage);
    });

    it('should update course profile image if there are any slideshow images', async () => {
      const courseProfileImage = createCourseImage({id: 1}),
          courseSlideshowImage = createCourseImage({id: 2}),
          courseBeforeUpdate = createCourse({profileImage: null, slideShow:[courseSlideshowImage]});

      mockCourseImagesService.delete.mockReturnValue(Promise.resolve());
      mockCourseImagesService.findOneById.mockReturnValue(courseProfileImage);
      mockCourseImagesService.update.mockReturnValue(Promise.resolve());
      mockCourseService.findOneById.mockReturnValue(courseBeforeUpdate);

      await coursesController.deleteImageFromSlideshow(courseBeforeUpdate.id, courseProfileImage.id);
      expect(mockCourseImagesService.update).toBeCalledWith(courseBeforeUpdate, courseBeforeUpdate.slideShow[0]);
    });
  });
});

