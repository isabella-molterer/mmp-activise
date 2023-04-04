import {MockRepository} from "../mocks/mock-repo";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {HttpException, HttpStatus} from "@nestjs/common";
import {createFileOptions, createGenerateTestFileparams, createGetParamsForAws} from "../factories/aws.test.factory";
import {Aws} from "../../src/config/aws";
import {ProviderImagesService} from "../../src/images/provider-images.service";
import {ProviderImages} from "../../src/images/provider-images.entity";
import {createProviderImage} from "../factories/images.test.factory";
import {createProvider} from "../factories/provider.test.factory";

describe('ProviderImagesService', () => {
    let providerImagesService: ProviderImagesService;
    let mockProviderImagesRepository: MockRepository<ProviderImages>;

    beforeEach(async () => {
        mockProviderImagesRepository = new MockRepository<ProviderImages>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProviderImagesService,
                {
                    provide: getRepositoryToken(ProviderImages),
                    useValue: mockProviderImagesRepository
                }
            ],
        }).compile();

        providerImagesService = module.get<ProviderImagesService>(ProviderImagesService);
    });

    it('should be defined', () => {
        expect(providerImagesService).toBeDefined();
    });

    describe('findOneById', () => {
        it('should return a provider image object', async () => {
            const providerImage = createProviderImage({});
            mockProviderImagesRepository.findOneOrFail.mockReturnValue(providerImage);
            expect(await providerImagesService.findOneById(providerImage.id)).toEqual(providerImage);
        });

        it('should throw an exception when no provider image with that id was found', async () => {
            expect.assertions(3);
            mockProviderImagesRepository.findOneOrFail.mockImplementation(() => {
                throw "findOneOrFail fails";
            });
            try {
                await providerImagesService.findOneById(0);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Image not found');
                expect(e.status).toBe(HttpStatus.NOT_FOUND);
            }
        });
    });

    describe('create', () => {
        it('should return the saved Provider image', async () => {
            const image = createProviderImage({}),
                provider = createProvider({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));

            mockProviderImagesRepository.save.mockReturnValue(Promise.resolve(image));

            expect(await providerImagesService.create(provider, file)).toEqual(image);
            expect(awsUploadFileToS3Spy).toBeCalledWith(file, provider.id, 'providers');
            expect(mockProviderImagesRepository.create).toBeCalledTimes(1);
            expect(mockProviderImagesRepository.save).toBeCalledTimes(1);
        });

        it('should throw an BadRequest Exception if image can not be saved', async () => {
            expect.assertions(3);
            const provider = createProvider({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockProviderImagesRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await providerImagesService.create(provider, file);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                expect(e.message).toBe('Could not save image');
            }
        });

        it('should delete image from aws if image can not be saved', async () => {
            expect.assertions(1);
            const provider = createProvider({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockProviderImagesRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await providerImagesService.create(provider, file);
            } catch (e) {
                expect(awsDeleteFileFromAwsSpy).toBeCalledWith(fileparams.params);
            }
        });
    });

    describe('update', () => {
        it('should return a provider image object', async () => {
            const image = createProviderImage({}),
                provider = createProvider({profileImage: image});

            mockProviderImagesRepository.save.mockReturnValue(Promise.resolve(image));
            expect(await providerImagesService.update(provider, image)).toEqual(image);
        });

        it('should throw an exception when image could not be updated', async () => {
            expect.assertions(3);
            const image = createProviderImage({}),
                provider = createProvider({profileImage: image});

            mockProviderImagesRepository.save.mockImplementation(() => {
                throw "save fails";
            });

            try {
                await providerImagesService.update(provider, image);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not update profile image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });

    describe('delete', () => {
        it('should return the deleted provider image object', async () => {
            const image = createProviderImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockProviderImagesRepository.delete.mockReturnValue(Promise.resolve(image));
            expect(await providerImagesService.delete(image)).toEqual(image);
            expect(awsGetParamsForAwsSpy).toBeCalledWith(image);
            expect(awsDeleteFileFromAwsSpy).toBeCalledWith(params);
        });


        it('should throw an exception when image could not be deleted', async () => {
            expect.assertions(3);
            const image = createProviderImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockProviderImagesRepository.delete.mockImplementation(() => {
                throw "delete fails";
            });
            try {
                await providerImagesService.delete(image);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not delete image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });
});
