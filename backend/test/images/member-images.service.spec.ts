import {MemberImageService} from "../../src/images/member-image.service";
import {MockRepository} from "../mocks/mock-repo";
import {MemberImage} from "../../src/images/member-image.entity";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {createMember} from "../factories/member.test.factory";
import {HttpException, HttpStatus} from "@nestjs/common";
import {createMemberImage} from "../factories/images.test.factory";
import {createFileOptions, createGenerateTestFileparams, createGetParamsForAws} from "../factories/aws.test.factory";
import {Aws} from "../../src/config/aws";

describe('MemberImagesService', () => {
    let memberImageService: MemberImageService;
    let mockMemberImageRepository: MockRepository<MemberImage>;

    beforeEach(async () => {
        mockMemberImageRepository = new MockRepository<MemberImage>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [MemberImageService,
                {
                    provide: getRepositoryToken(MemberImage),
                    useValue: mockMemberImageRepository
                }
            ],
        }).compile();

        memberImageService = module.get<MemberImageService>(MemberImageService);
    });

    it('should be defined', () => {
        expect(memberImageService).toBeDefined();
    });

    describe('findOneById', () => {
        it('should return a member image object', async () => {
            const memberImage = createMemberImage({});
            mockMemberImageRepository.findOneOrFail.mockReturnValue(memberImage);
            expect(await memberImageService.findOneById(memberImage.id)).toEqual(memberImage);
        });

        it('should throw an exception when no member image with that id was found', async () => {
            expect.assertions(3);
            mockMemberImageRepository.findOneOrFail.mockImplementation(() => {
                throw "findOneOrFail fails";
            });
            try {
                await memberImageService.findOneById(0);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Image not found');
                expect(e.status).toBe(HttpStatus.NOT_FOUND);
            }
        });
    });

    describe('create', () => {
        it('should return the saved Member image', async () => {
            const image = createMemberImage({}),
                member = createMember({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));

            mockMemberImageRepository.save.mockReturnValue(image);

            expect(await memberImageService.create(member, file)).toEqual(image);
            expect(awsUploadFileToS3Spy).toBeCalledWith(file, member.id, 'members');
            expect(mockMemberImageRepository.create).toBeCalledTimes(1);
            expect(mockMemberImageRepository.save).toBeCalledTimes(1);
        });

        it('should throw an BadRequest Exception if image can not be saved', async () => {
            expect.assertions(3);
            const member = createMember({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockMemberImageRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await memberImageService.create(member, file);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                expect(e.message).toBe('Could not update profile image of member');

            }
        });

        it('should delete image from aws if image can not be saved', async () => {
            expect.assertions(1);
            const member = createMember({}),
                file = createFileOptions({}),
                fileparams = createGenerateTestFileparams({}),
                awsUploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsUploadFileToS3Spy.mockReturnValue(Promise.resolve(fileparams));
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockMemberImageRepository.create.mockImplementation(() => {
                throw "Can not create";
            });

            try {
                await memberImageService.create(member, file);
            } catch (e) {
                expect(awsDeleteFileFromAwsSpy).toBeCalledWith(fileparams.params);
            }
        });
    });

    describe('update', () => {
        it('should return a member image object', async () => {
            const image = createMemberImage({}),
                member = createMember({profileImage: image}),
                file = createFileOptions({}),
                oldParams = createGetParamsForAws({}),
                newParams = createGenerateTestFileparams({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws"),
                awsuploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");

            awsGetParamsForAwsSpy.mockReturnValue(oldParams);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());
            awsuploadFileToS3Spy.mockReturnValue(Promise.resolve(newParams));

            mockMemberImageRepository.save.mockReturnValue(image);
            expect(await memberImageService.update(member, file)).toEqual(image);
            expect(awsGetParamsForAwsSpy).toBeCalledWith(image);
            expect(awsDeleteFileFromAwsSpy).toBeCalledWith(oldParams);
            expect(awsuploadFileToS3Spy).toBeCalledWith(file, member.id, 'members');
        });

        it('should throw an exception when image could not be updated', async () => {
            expect.assertions(3);
            const image = createMemberImage({}),
                member = createMember({profileImage: image}),
                file = createFileOptions({}),
                oldParams = createGetParamsForAws({}),
                newParams = createGenerateTestFileparams({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws"),
                awsuploadFileToS3Spy = jest.spyOn(Aws, "uploadFileToS3");

            awsGetParamsForAwsSpy.mockReturnValue(oldParams);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());
            awsuploadFileToS3Spy.mockReturnValue(Promise.resolve(newParams));

            mockMemberImageRepository.save.mockImplementation(() => {
                throw "save fails";
            });

            try {
                await memberImageService.update(member, file);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not update profile image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });

    describe('delete', () => {
        it('should return the deleted member image object', async () => {
            const image = createMemberImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockMemberImageRepository.delete.mockReturnValue(image);
            expect(await memberImageService.delete(image)).toEqual(image);
            expect(awsGetParamsForAwsSpy).toBeCalledWith(image);
            expect(awsDeleteFileFromAwsSpy).toBeCalledWith(params);
        });


        it('should throw an exception when image could not be deleted', async () => {
            expect.assertions(3);
            const image = createMemberImage({}),
                params = createGetParamsForAws({}),
                awsGetParamsForAwsSpy = jest.spyOn(Aws, "getParamsForAws"),
                awsDeleteFileFromAwsSpy = jest.spyOn(Aws, "deleteFileFromAws");

            awsGetParamsForAwsSpy.mockReturnValue(params);
            awsDeleteFileFromAwsSpy.mockReturnValue(Promise.resolve());

            mockMemberImageRepository.delete.mockImplementation(() => {
                throw "delete fails";
            });
            try {
                await memberImageService.delete(image);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpException);
                expect(e.message).toBe('Could not delete image');
                expect(e.status).toBe(HttpStatus.BAD_REQUEST);
            }
        });
    });
});
