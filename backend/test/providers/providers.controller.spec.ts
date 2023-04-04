import { Test } from '@nestjs/testing';
import {ProvidersService} from "../../src/providers/providers.service";
import {Provider} from "../../src/providers/provider.entity";
import { ProvidersController } from '../../src/providers/providers.controller';
import { ProviderImages } from '../../src/images/provider-images.entity';
import { ProviderImagesService } from '../../src/images/provider-images.service';
import { MockService } from '../mocks/mock-service';
import { Link } from '../../src/links/link.entity';
import { LinksService } from '../../src/links/links.service';
import { createProvider, createProviderDto } from '../factories/provider.test.factory';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createSuccessResponse } from '../factories/response.test.factory';
import { createFileOptions } from '../factories/aws.test.factory';
import { createProviderImage } from '../factories/images.test.factory';
import { createLink } from '../factories/link.test.factory';
import { Course } from '../../src/courses/course.entity';
import { CoursesService } from '../../src/courses/courses.service';
import {createCourse} from "../factories/course.test.factory";
import {CrudRequest, GetManyDefaultResponse} from "@nestjsx/crud";

describe('Providers Controller', () => {
  let providersController: ProvidersController;
  let mockProvidersService: MockService<Provider>
  let mockProviderImagesService: MockService<ProviderImages>
  let mockLinksService: MockService<Link>
  let mockCoursesService: MockService<Course>

  beforeEach(async () => {
    mockProvidersService = new MockService<Provider>();
    mockProviderImagesService = new MockService<ProviderImages>();
    mockLinksService = new MockService<Link>();
    mockCoursesService = new MockService<Course>();
    const module = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
        {
          provide: ProviderImagesService,
          useValue: mockProviderImagesService
        },
        {
          provide: CoursesService,
          useValue: mockCoursesService
        },
        {
          provide: LinksService,
          useValue: mockLinksService
        },
      ]
    })
    .compile();
    providersController = module.get<ProvidersController>(ProvidersController);
  });

  it('should be defined', () => {
    expect(mockProvidersService).toBeDefined();
    expect(mockProviderImagesService).toBeDefined();
    expect(mockLinksService).toBeDefined();
    expect(providersController).toBeDefined();
  });

  describe('me', () => {
    it('should return provider profile', async () => {
      const provider = createProvider({})
      mockProvidersService.findOneById.mockReturnValue(provider)

      await providersController.getProfile( { user: { id: 1 } } )
      expect(mockProvidersService.findOneById).toBeCalledTimes(1)
      expect(await providersController.getProfile({ user: { id: provider.id} })).toEqual(provider)
    });
  })

  describe('base', () => {
    it('should return providerController', async () => {
      expect(providersController.base).toEqual(providersController)
    });
  })

  describe('getOne', () => {
    it('should return requested provider', async () => {
      const courses = [createCourse({}), createCourse({})],
          provider = createProvider({courses: courses}),
          req: CrudRequest = {options: null, parsed: null},
          getOneBaseSpy = jest.spyOn(providersController.base, "getOneBase");
      getOneBaseSpy.mockReturnValue(Promise.resolve(provider));
      mockCoursesService.removeUnpublishedCourses.mockReturnValue(courses);

      expect(await providersController.getOne(req)).toEqual(provider);
      expect(getOneBaseSpy).toBeCalledWith(req);
      expect( mockCoursesService.removeUnpublishedCourses).toBeCalledWith(courses);
    });
  });

  describe('getMany', () => {
    it('should return array of providers', async () => {
      const provider = createProvider({courses: []}),
          providers = [provider, provider],
          req: CrudRequest = {options: null, parsed: null},
          getManyBaseSpy = jest.spyOn(providersController.base, "getManyBase");
      getManyBaseSpy.mockReturnValue(Promise.resolve(providers));
      mockCoursesService.removeUnpublishedCourses.mockReturnValue([]);

      expect(await providersController.getMany(req)).toEqual(providers);
      expect(getManyBaseSpy).toBeCalledWith(req);
    });

    it('should call removeUnpublishedCourses only once if there is only one provider', async () => {
      const provider: GetManyDefaultResponse<Provider> = {
        data: [createProvider({courses: []})],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      };
      const req: CrudRequest = {options: null, parsed: null},
          getManyBaseSpy = jest.spyOn(providersController.base, "getManyBase");

      getManyBaseSpy.mockReturnValue(Promise.resolve(provider));
      mockCoursesService.removeUnpublishedCourses.mockReturnValue([]);

      expect(await providersController.getMany(req)).toEqual(provider);
      expect( mockCoursesService.removeUnpublishedCourses).toBeCalledTimes(1);
      expect( mockCoursesService.removeUnpublishedCourses).toBeCalledWith([]);
    });

    it('should call removeUnpublishedCourses for each provider', async () => {
      const courses = [createCourse({}), createCourse({})],
          provider = createProvider({courses: courses}),
          providers = [provider, provider],
          req: CrudRequest = {options: null, parsed: null},
          getManyBaseSpy = jest.spyOn(providersController.base, "getManyBase");
      getManyBaseSpy.mockReturnValue(Promise.resolve(providers));
      mockCoursesService.removeUnpublishedCourses.mockReturnValue(courses);

      await providersController.getMany(req);
      expect( mockCoursesService.removeUnpublishedCourses).toBeCalledTimes(providers.length);
      expect( mockCoursesService.removeUnpublishedCourses).toBeCalledWith(courses);
    });
  });

  describe('updateOne', () => {
    it('should throw an exception when dto contains password', async() => {
      const provider = createProvider({})
      const providerDto = createProviderDto({});
      expect.assertions(3);
      try {
        await providersController.updateOne( provider.id, providerDto )
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Malformed request');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    })

    it('should return updated provider object', async() => {
      const providerDto = createProviderDto({password: null})
      const provider = createProvider({});
      mockProvidersService.update.mockReturnValue(provider);
      expect(await providersController.updateOne( provider.id, providerDto ) ).toEqual(provider)
    })
  })

  describe('deleteOne', () => {
    it('should return success message when provider got deleted in database successsfully', async () => {
      const provider = createProvider({});
      mockProvidersService.deleteOneById.mockReturnValue(provider);

      const successResponse = createSuccessResponse({})
      expect(await providersController.deleteOne(provider.id) ).toEqual(successResponse)
    });
  })

  describe('uploadImage', () => {
    it('should return providerImage object when file was submitted', async () => {
      const file = createFileOptions({}),
      provider = createProvider({}),
      providerImage = createProviderImage({});

      mockProvidersService.findOneById.mockReturnValue(Promise.resolve(provider));
      mockProviderImagesService.create.mockReturnValue(Promise.resolve(providerImage));

      expect(await providersController.uploadImage(provider.id, file)).toEqual(providerImage);
    });

    it('should throw exception if no file was provided', async () => {
      expect.assertions(3);
      const file = null,
      provider = createProvider({});

      try {
        await providersController.uploadImage(provider.id, file)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('No file submitted');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('setProfileImage', () => {
    it('should return memberImage object when file was submitted', async () => {
      const provider = createProvider({}),
      providerImage = createProviderImage({});

      mockProvidersService.findOneById.mockReturnValue(Promise.resolve(provider));
      mockProviderImagesService.findOneById.mockReturnValue(Promise.resolve(providerImage));
      mockProviderImagesService.update.mockReturnValue(Promise.resolve(providerImage));

      const result = await providersController.setProfileImage(provider.id, providerImage.id)
      expect(result).toEqual(providerImage);
      expect(mockProvidersService.findOneById).toBeCalledWith(provider.id, {relations: ["profileImage"]})
      expect(mockProviderImagesService.findOneById).toBeCalledWith(providerImage.id, {relations: ["provider"]})
      expect(mockProviderImagesService.update).toBeCalledWith(provider, providerImage)
    });
  });

  describe('deleteImageFromSlideshow', () => {
    it('should throw exception if no currentImage was found', async () => {
      expect.assertions(3);
      const provider = createProvider({}),
      providerImage = createProviderImage({});

      mockProviderImagesService.findOneById.mockReturnValue(null);

      try {
        await providersController.deleteImageFromSlideshow(provider.id, providerImage.id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User does not have a profile image');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should delete the image from the slideshow successfully', async () => {
      const provider = createProvider({profileImage: createProviderImage({})}),
      providerImage = createProviderImage({});

      mockProviderImagesService.findOneById.mockReturnValue(Promise.resolve(providerImage));
      mockProviderImagesService.delete.mockReturnValue(Promise.resolve());
      mockProvidersService.findOneById.mockReturnValue(Promise.resolve(provider));

      const result = await providersController.deleteImageFromSlideshow(provider.id, providerImage.id);
      const response = createSuccessResponse({message: 'Image got deleted successfully'})
      expect(result).toEqual(response);
      expect(mockProviderImagesService.findOneById).toHaveBeenCalledWith(providerImage.id)
      expect(mockProviderImagesService.delete).toHaveBeenCalledWith(providerImage)
      expect(mockProvidersService.findOneById).toHaveBeenCalledTimes(1)
    });

    it('should delete the image from the slideshow and set new profileImage successfully ', async () => {
      const providerImage = createProviderImage({});
      const provider = createProvider({slideShow: [providerImage, providerImage]});

      mockProviderImagesService.findOneById.mockReturnValue(Promise.resolve(providerImage));
      mockProviderImagesService.delete.mockReturnValue(Promise.resolve());
      mockProvidersService.findOneById.mockReturnValue(Promise.resolve(provider));
      mockProviderImagesService.update.mockReturnValue(Promise.resolve());

      const result = await providersController.deleteImageFromSlideshow(provider.id, providerImage.id);
      const response = createSuccessResponse({message: 'Image got deleted successfully'})
      expect(result).toEqual(response);
      expect(mockProviderImagesService.delete).toHaveBeenCalledWith(providerImage)
      expect(mockProviderImagesService.update).toHaveBeenCalledWith(provider, provider.slideShow[0])
    });
  });

  describe('deleteLink', () => {
    it('should delete link on provider object', async () => {
      const link = createLink({})

      mockLinksService.update.mockReturnValue(Promise.resolve(link));
      const response = createSuccessResponse({message: 'Link got deleted successfully'})
      expect(await providersController.deleteLink(link.id)).toEqual(response);
    });
  });
});
