import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken} from "@nestjs/typeorm";
import {Provider} from "../../src/providers/provider.entity";
import {ProvidersService} from "../../src/providers/providers.service"
import {MockRepository} from "../mocks/mock-repo";
import {BadRequestException, ConflictException, HttpException, HttpStatus} from "@nestjs/common";
import {ProviderImages} from "../../src/images/provider-images.entity";
import {ProviderImagesService} from "../../src/images/provider-images.service";
import {CoursesService} from "../../src/courses/courses.service";
import {Course} from "../../src/courses/course.entity";
import {CourseImagesService} from "../../src/images/course-images.service";
import {CourseImages} from "../../src/images/course-images.entity";
import * as bcrypt from "bcrypt";
import {createProvider, createProviderDto} from "../factories/provider.test.factory";
import {createImage} from "../factories/images.test.factory";

describe('ProvidersService', () => {
  let providerService: ProvidersService;
  let providerImageService: ProviderImagesService;
  let coursesService: CoursesService;
  let mockProviderRepository: MockRepository<Provider>;
  let mockProviderImagesRepository: MockRepository<ProviderImages>;
  let mockCourseRepository: MockRepository<Course>;
  let mockCourseImagesRepository: MockRepository<CourseImages>;

  beforeEach(async () => {
    mockProviderRepository = new MockRepository<Provider>();
    mockProviderImagesRepository = new MockRepository<ProviderImages>();
    mockCourseRepository = new MockRepository<Course>();
    mockCourseImagesRepository = new MockRepository<CourseImages>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvidersService,
        {
          provide: getRepositoryToken(Provider),
          useValue: mockProviderRepository
        },
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository
        },
        ProviderImagesService,
        {
          provide: getRepositoryToken(ProviderImages),
          useValue: mockProviderImagesRepository
        },
        CourseImagesService,
        {
          provide: getRepositoryToken(CourseImages),
          useValue: mockCourseImagesRepository
        },
      ],
    }).compile();
    providerService = module.get<ProvidersService>(ProvidersService);
    coursesService = module.get<CoursesService>(CoursesService);
    providerImageService = module.get<ProviderImagesService>(ProviderImagesService);
  });

  it('should be defined', () => {
    expect(providerService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a provider object', async () => {
      const provider = createProvider({});
      mockProviderRepository.findOneOrFail.mockReturnValue(provider);
      expect(await providerService.findOneById(provider.id)).toEqual(provider);
    });

    it('should throw an exception when no provider with that id was found', async () => {
      expect.assertions(3);
      mockProviderRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await providerService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Provider not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('findOneByEmail', () => {
    it('should return a provider object', async () => {
      const provider = createProvider({});
      mockProviderRepository.findOneOrFail.mockReturnValue(provider);
      expect(await providerService.findOneByEmail(provider.email)).toEqual(provider);
    });

    it('should throw an exception when no provider with that mail was found', async () => {
      expect.assertions(3);
      mockProviderRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await providerService.findOneByEmail('test@example.com');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Provider not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });


  describe('checkForExistingUser', () => {
    it('should return truthy if provider exists', async () => {
      const providerDto = createProviderDto({});
      mockProviderRepository.findOne.mockReturnValue(Promise.resolve({email: providerDto.email}));
      expect(await providerService.checkForExistingUser(providerDto.email)).toBeTruthy();
    });

    it('should return falsy if provider does not exist', async () => {
      const providerDto = createProviderDto({});
      mockProviderRepository.findOne.mockReturnValue(Promise.resolve(undefined));
      expect(await providerService.checkForExistingUser(providerDto.email)).toBeFalsy();
    });
  });


  describe('create', () => {
    it('should return the saved Provider', async () => {
      const provider = createProvider({});
      const providerDto = createProviderDto({});
      const providerServiceSpy = jest.spyOn(providerService, "checkForExistingUser");
      providerServiceSpy.mockReturnValue(Promise.resolve(undefined));
      mockProviderRepository.create.mockReturnValue(provider);
      mockProviderRepository.save.mockReturnValue(provider);
      expect(await providerService.create(providerDto)).toEqual(provider);
    });

    it('should throw an Conflict Exception if the user already exists', async () => {
      const providerDto = createProviderDto({});
      expect.assertions(3);
      const providerServiceSpy = jest.spyOn(providerService, "checkForExistingUser");
      providerServiceSpy.mockReturnValue(Promise.resolve(true));

      try {
        await providerService.create(providerDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('User already exists');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should throw an BadRequest Exception if the user can not be saved', async () => {
      const providerDto = createProviderDto({});
      expect.assertions(2);
      const providerServiceSpy = jest.spyOn(providerService, "checkForExistingUser");
      providerServiceSpy.mockReturnValue(Promise.resolve(undefined));
      mockProviderRepository.create.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await providerService.create(providerDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });


  describe('update', () => {
    it('should return updated Provider', async () => {
      const provider = createProvider({});
      const returnProvider = createProvider({contactPerson: 'Bella'});
      const providerDto = createProviderDto({contactPerson: 'Bella'});
      mockProviderRepository.findOne.mockReturnValue(undefined);
      mockProviderRepository.findOne.mockReturnValue(provider);
      mockProviderRepository.save.mockReturnValue(returnProvider);

      expect(await providerService.update(provider.id, providerDto)).toEqual(returnProvider);
    });

    it('should throw an Conflict Exception if the email is already taken', async () => {
      expect.assertions(3);

      const provider = createProvider({});
      const providerDto = createProviderDto({});
      mockProviderRepository.findOne.mockReturnValue(provider);

      try {
        await providerService.update(0, providerDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('Email already taken');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should not throw an Conflict Exception if email is from current user', async () => {
      const provider = createProvider({});
      const providerDto = createProviderDto({contactPerson: 'Bella'});
      mockProviderRepository.findOne.mockReturnValue(provider);
      await providerService.update(provider.id, providerDto);
      expect(mockProviderRepository.save).toBeCalledTimes(1);
    });

    it('should throw a Bad Request Exception when unable to save', async () => {
      expect.assertions(2);
      const provider = createProvider({});
      const providerDto = createProviderDto({});
      mockProviderRepository.findOne.mockReturnValue(undefined);
      mockProviderRepository.findOne.mockReturnValue(provider);
      mockProviderRepository.save.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await providerService.update(provider.id, providerDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });


  describe('setPassword', () => {
    it('should return provider object with new password', async () => {
      const provider = createProvider({});
      const password = 'newPassword';
      const updatedProvider = createProvider({password: password});

      const providerServiceSpy = jest.spyOn(providerService, "findOneByEmail");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));
      mockProviderRepository.save.mockReturnValue(updatedProvider);

      expect(await providerService.setPassword(provider.email, password)).toEqual(updatedProvider);
    });

    it('encrypt the new password', async () => {
      const provider = createProvider({});
      const password = 'newPassword';

      const providerServiceSpy = jest.spyOn(providerService, "findOneByEmail");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      const bcryptSpy = jest.spyOn(bcrypt, "hash");
      bcryptSpy.mockReturnValue(Promise.resolve('encrypted new Password'));

      await providerService.setPassword(provider.email, password);
      expect(bcryptSpy).toBeCalledTimes(1);
    });

    it('should throw Exception when unable to update password', async () => {
      expect.assertions(3);

      const provider = createProvider({});
      const providerServiceSpy = jest.spyOn(providerService, "findOneByEmail");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      mockProviderRepository.save.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await providerService.setPassword(provider.email, provider.password);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not update password');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('deleteOneById', () => {

    it('should delete all courses before deleting provider', async () => {
      const provider = createProvider({});
      provider.courses = [{id: 1}, {id: 2}];

      const providerServiceSpy = jest.spyOn(providerService, "findOneById");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      const coursesServiceSpy = jest.spyOn(coursesService, "deleteOneById");
      coursesServiceSpy.mockReturnValue(Promise.resolve(provider.courses[0]));

      mockProviderRepository.delete.mockReturnValue(provider);
      await providerService.deleteOneById(provider.id);
      expect(coursesServiceSpy).toBeCalledTimes(2);
    });

    it('should delete all images before deleting provider', async () => {
      const provider = createProvider({});
      const image1 = createImage({});
      const image2 = createImage({});
      provider.profileImage = image1;
      provider.slideShow = [image1, image2];

      const providerServiceSpy = jest.spyOn(providerService, "findOneById");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      const providerImageServiceSpy = jest.spyOn(providerImageService, "delete");
      providerImageServiceSpy.mockReturnValue(Promise.resolve(provider.profileImage));

      mockProviderRepository.delete.mockReturnValue(provider);
      await providerService.deleteOneById(provider.id);
      expect(providerImageServiceSpy).toBeCalledTimes(2);
    });

    it('should return deleted provider object', async () => {
      const provider = createProvider({});

      const providerServiceSpy = jest.spyOn(providerService, "findOneById");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      mockProviderRepository.delete.mockReturnValue(provider);

      expect(await providerService.deleteOneById(provider.id)).toEqual(provider);
    });

    it('should throw Exception when unable to delete', async () => {
      expect.assertions(3);

      const provider = createProvider({});
      const providerServiceSpy = jest.spyOn(providerService, "findOneById");
      providerServiceSpy.mockReturnValue(Promise.resolve(provider));

      mockProviderRepository.delete.mockImplementation(() => {
        throw "Can not delete";
      });

      try {
        await providerService.deleteOneById(provider.id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not delete provider');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
