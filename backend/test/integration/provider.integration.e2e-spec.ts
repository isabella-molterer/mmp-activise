import { Test } from '@nestjs/testing';
import {ProvidersService} from "../../src/providers/providers.service";
import {Provider} from "../../src/providers/provider.entity";
import { ProvidersController } from '../../src/providers/providers.controller';
import { ProviderImages } from '../../src/images/provider-images.entity';
import { ProviderImagesService } from '../../src/images/provider-images.service';
import { Link } from '../../src/links/link.entity';
import { LinksService } from '../../src/links/links.service';
import { createProvider, createProviderResponse } from '../factories/provider.test.factory';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Course } from '../../src/courses/course.entity';
import { CoursesService } from '../../src/courses/courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/mock-repo';
import { CourseImages } from '../../src/images/course-images.entity';
import { CourseImagesService } from '../../src/images/course-images.service';
import { createCourse } from '../factories/course.test.factory';
import * as request from 'supertest'

xdescribe('Provider integration test', () => {
    let app: INestApplication;

    let providersController: ProvidersController;
    let mockProviderRepository: MockRepository<Provider>;
    let mockProviderImagesRepository: MockRepository<ProviderImages>;
    let mockCourseRepository: MockRepository<Course>;
    let mockCourseImagesRepository: MockRepository<CourseImages>;
    let mockLinkRepository: MockRepository<Link>;

    const providers = [
        createProvider({}),
        createProvider({}),
    ]

    beforeAll(async () => {
        mockProviderRepository = new MockRepository<Provider>();
        mockProviderImagesRepository = new MockRepository<ProviderImages>();
        mockCourseRepository = new MockRepository<Course>();
        mockCourseImagesRepository = new MockRepository<CourseImages>();
        mockLinkRepository = new MockRepository<Link>();

        mockProviderRepository.getMany.mockReturnValue(Promise.resolve(providers))

        const module = await Test.createTestingModule({
        controllers: [ProvidersController],
        providers: [
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
            LinksService,
            {
                provide: getRepositoryToken(Link),
                useValue: mockLinkRepository
            },
        ]
        })
        .compile();
        providersController = module.get<ProvidersController>(ProvidersController) 
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    describe('getMany providers', () => {
        it('should return public providers', async () => {
            const testCoursesMock = [
                createCourse({id: 1, isPublished: true, provider: createProvider({isPublished: true})}),
                createCourse({id: 2, isPublished: true,  provider: createProvider({isPublished: true})}),
            ]

            const testProvidersMock = [
                createProvider({id: 1, courses: testCoursesMock}),
                createProvider({id: 2, courses: testCoursesMock}),
            ]

            const testProvidersResponse = [
                createProviderResponse({id: 1}),
                createProviderResponse({id: 2}),
            ]

            const spy = jest.spyOn(providersController.base, "getManyBase");
            spy.mockReturnValue(Promise.resolve(testProvidersMock))

            const response = await request(app.getHttpServer())
            .get('/')
            expect(response.status).toBe(200)     
            expect(response.body).toEqual(testProvidersResponse)           
        })
    })

   
})