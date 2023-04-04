import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/mock-repo';
import {HttpException, HttpStatus} from "@nestjs/common";
import {CourseDatesService} from "../../src/course-dates/course-dates.service";
import {CourseDate} from "../../src/course-dates/course-date.entity";
import {createCourseDate} from "../factories/courseDate.test.factory";

describe('CourseDatesService', () => {
  let courseDatesService: CourseDatesService;
  let mockCourseDateRepository: MockRepository<CourseDate>;

  beforeEach(async () => {
    mockCourseDateRepository = new MockRepository<CourseDate>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseDatesService,
        {
          provide: getRepositoryToken(CourseDate),
          useValue: mockCourseDateRepository
        }
      ],
    }).compile();

    courseDatesService = module.get<CourseDatesService>(CourseDatesService);
  });

  it('should be defined', () => {
    expect(courseDatesService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a course date object', async () => {
      const courseDate = createCourseDate({});
      mockCourseDateRepository.findOneOrFail.mockReturnValue(courseDate);
      expect(await courseDatesService.findOneById(courseDate.id)).toEqual(courseDate);
    });

    it('should throw an exception when no course date with that id was found', async () => {
      expect.assertions(3);
      mockCourseDateRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await courseDatesService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Course Date not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
