import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../../src/courses/courses.service';
import { getRepositoryToken} from "@nestjs/typeorm";
import { MockRepository } from '../mocks/mock-repo';
import {CourseImages} from "../../src/images/course-images.entity";
import {Course} from "../../src/courses/course.entity";
import {CourseImagesService} from "../../src/images/course-images.service";
import {BadRequestException, HttpException, HttpStatus} from "@nestjs/common";
import {createCourse, createCourseDto} from "../factories/course.test.factory";
import {createImage} from "../factories/images.test.factory";

describe('CoursesService', () => {
  let coursesService: CoursesService;
  let courseImagesService: CourseImagesService;
  let mockCourseRepository: MockRepository<Course>;
  let mockCourseImagesRepository: MockRepository<CourseImages>;

  beforeEach(async () => {
    mockCourseRepository = new MockRepository<Course>();
    mockCourseImagesRepository = new MockRepository<CourseImages>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository
        },
        CourseImagesService,
        {
          provide: getRepositoryToken(CourseImages),
          useValue: mockCourseImagesRepository
        }
      ],
    }).compile();

    coursesService = module.get<CoursesService>(CoursesService);
    courseImagesService = module.get<CourseImagesService>(CourseImagesService);
  });

  it('should be defined', () => {
    expect(coursesService).toBeDefined();
    expect(courseImagesService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a course object', async () => {
      const course = createCourse({});
      mockCourseRepository.findOneOrFail.mockReturnValue(course);
      expect(await coursesService.findOneById(course.id)).toEqual(course);
    });

    it('should throw an exception when no course with that id was found', async () => {
      expect.assertions(3);
      mockCourseRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await coursesService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Course not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });


  describe('update', () => {
    it('should return a course object', async () => {
      const course = createCourse({});
      const courseDto = createCourseDto({});

      const courseServiceSpy = jest.spyOn(coursesService, "findOneById");
      courseServiceSpy.mockReturnValue(Promise.resolve(course));
      mockCourseRepository.save.mockReturnValue(course);

      expect(await coursesService.update(course.id, courseDto)).toEqual(course);
    });

    it('should throw a Bad Request Exception if entity can not be updated', async () => {
      expect.assertions(2);

      const course = createCourse({});
      const courseDto = createCourseDto({});

      const courseServiceSpy = jest.spyOn(coursesService, "findOneById");
      courseServiceSpy.mockReturnValue(Promise.resolve(course));
      mockCourseRepository.save.mockImplementation(() => {
        throw "Can not update";
      });

      try {
        await coursesService.update(course.id, courseDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('deleteOneById', () => {
    it('should return deleted course object', async () => {
      const course = createCourse({});

      const courseServiceSpy = jest.spyOn(coursesService, "findOneById");
      courseServiceSpy.mockReturnValue(Promise.resolve(course));

      mockCourseRepository.delete.mockReturnValue(course);

      expect(await coursesService.deleteOneById(course.id)).toEqual(course);
    });

    it('should delete images before deleting course', async () => {
      const course = createCourse({slideShow: [createImage({}), createImage({})], profileImage: createImage({})});

      const courseServiceSpy = jest.spyOn(coursesService, "findOneById");
      courseServiceSpy.mockReturnValue(Promise.resolve(course));

      const courseImageServiceSpy = jest.spyOn(courseImagesService, "delete");
      courseImageServiceSpy.mockReturnValue(Promise.resolve(course.profileImage));

      mockCourseRepository.delete.mockReturnValue(course);

      await coursesService.deleteOneById(course.id);
      expect(courseImageServiceSpy).toBeCalledTimes(2);
    });

    it('should throw a Bad Request Exception if entity can not be deleted', async () => {
      expect.assertions(3);
      const course = createCourse({});

      const courseServiceSpy = jest.spyOn(coursesService, "findOneById");
      courseServiceSpy.mockReturnValue(Promise.resolve(course));

      mockCourseRepository.delete.mockImplementation(() => {
        throw "Can not delete";
      });

      try {
        await coursesService.deleteOneById(course.id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
        expect(e.message).toBe('Could not delete course');
      }
    });
  });

  describe('removeUnpublishedCourses', () => {
    it('should return only published courses', async () => {
      const allCourses =  [
          createCourse({id: 1}),
          createCourse({id: 2}),
          createCourse({id: 3, isPublished: false})
      ]

      const filteredCourses = [
        createCourse({id: 1}), 
        createCourse({id: 2})
      ]

      const result = coursesService.removeUnpublishedCourses(allCourses)
      expect(JSON.stringify(result)).toEqual(JSON.stringify(filteredCourses));
    });
  });
});
