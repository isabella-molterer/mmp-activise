import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from '../../src/members/members.controller';
import {Member} from "../../src/members/member.entity";
import {MembersService} from "../../src/members/members.service";
import { MemberImage } from '../../src/images/member-image.entity';
import { MemberImageService } from '../../src/images/member-image.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import {MockService} from "../mocks/mock-service";
import {createMember, createMemberDto} from "../factories/member.test.factory";
import {createFileOptions} from "../factories/aws.test.factory";
import {createMemberImage} from "../factories/images.test.factory";

describe('Members Controller', () => {
  let membersController: MembersController;
  let mockMemberService: MockService<Member>
  let mockMemberImageService: MockService<MemberImage>

  beforeEach(async () => {
    mockMemberService = new MockService<Member>();
    mockMemberImageService = new MockService<MemberImage>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        {
          provide: MembersService,
          useValue: mockMemberService,
        },
        MemberImageService,
        {
          provide: MemberImageService,
          useValue: mockMemberImageService,
        }
      ],
    })
    .compile();
    membersController = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(mockMemberService).toBeDefined();
    expect(mockMemberImageService).toBeDefined();
    expect(membersController).toBeDefined();
  });

  describe('me', () => {
    it('should return a member object', async () => {
      const member = createMember({})
      mockMemberService.findOneById.mockReturnValue(member)
      await membersController.getProfile( { user: { id: 1 } } )
      expect(mockMemberService.findOneById).toBeCalledTimes(1)
      expect(await membersController.getProfile({ user: { id: member.id} })).toEqual(member)
    });
  })

  describe('updateOne', () => {
    it('should throw an exception when dto contains password', async() => {
      const member = createMember({});
      const memberDto = {password: 'geheim', ...createMemberDto({})};
      expect.assertions(3);
      try {
        mockMemberService.update.mockReturnValue({})
        await membersController.updateOne( member.id, memberDto )
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Malformed request');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    })

    it('should return updated member object', async() => {
      const memberDto = createMemberDto({})
      const member = createMember({});
      mockMemberService.update.mockReturnValue(member);
      expect(await membersController.updateOne( member.id, memberDto ) ).toEqual(member)
    })
  })

  describe('deleteOne', () => {
    it('should return success message when course was successfully deleted from db', async () => {
      mockMemberService.deleteOneById(Promise.resolve());
      const result = await membersController.deleteOne(1);
      expect(result.statusCode).toEqual(200);
      expect(result.message).toEqual('Profile got deleted successfully');
    });
  });

  describe('uploadImage', () => {

    it('should return memberImage object when file was submitted', async () => {
      const file = createFileOptions({}),
          member = createMember({}),
          memberImage = createMemberImage({});

      mockMemberService.findOneById.mockReturnValue(Promise.resolve(member));
      mockMemberImageService.create.mockReturnValue(Promise.resolve(memberImage));

      expect(await membersController.uploadImage(member.id, file)).toEqual(memberImage);
    });

    it('should throw exception if no file was provided', async () => {
      expect.assertions(3);
      const file = null,
          member = createMember({});
      try {
        await membersController.uploadImage(member.id, file)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('No file submitted');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

  });

  describe('updateImage', () => {

    it('should return memberImage object when file was submitted', async () => {
      const file = createFileOptions({}),
          member = createMember({}),
          memberImage = createMemberImage({});

      mockMemberService.findOneById.mockReturnValue(Promise.resolve(member));
      mockMemberImageService.update.mockReturnValue(Promise.resolve(memberImage));

      expect(await membersController.updateImage(1, file)).toEqual(memberImage);
    });

    it('should throw exception if no file was provided', async () => {
      expect.assertions(3);
      const file = null;
      try {
        await membersController.updateImage(1, file)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('No file submitted');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('deleteImage', () => {
    it('should throw exception if no file was provided', async () => {
      const memberImage = createMemberImage({}),
          member = createMember({profileImage: memberImage});

      mockMemberService.findOneById.mockReturnValue(Promise.resolve(member));
      mockMemberImageService.delete.mockReturnValue(Promise.resolve(memberImage));

      const result = await membersController.deleteImage(1);
      expect(result.statusCode).toEqual(200);
      expect(result.message).toEqual('Image got deleted successfully');
    });

      it('should throw exception if no file was provided', async () => {
      expect.assertions(3);
      const member = createMember({profileImage: null})
      mockMemberService.findOneById.mockReturnValue(member);
      try {
        await membersController.deleteImage(1)
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User does not have a profile image');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
