import {Test, TestingModule} from '@nestjs/testing';
import {MembersService} from '../../src/members/members.service';
import {getRepositoryToken} from "@nestjs/typeorm";
import {Member} from "../../src/members/member.entity";
import {MockRepository} from "../mocks/mock-repo";
import {MemberImage} from "../../src/images/member-image.entity";
import {MemberImageService} from "../../src/images/member-image.service";
import {BadRequestException, ConflictException, HttpException, HttpStatus} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {createMember, createMemberDto} from "../factories/member.test.factory";
import {createImage} from "../factories/images.test.factory";

describe('MembersService', () => {
  let memberService: MembersService;
  let memberImageService: MemberImageService;
  let mockMemberRepository: MockRepository<Member>;
  let mockMemberImageRepository: MockRepository<MemberImage>;

  beforeEach(async () => {
    mockMemberRepository = new MockRepository<Member>();
    mockMemberImageRepository = new MockRepository<MemberImage>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository
        },
        MemberImageService,
        {
          provide: getRepositoryToken(MemberImage),
          useValue: mockMemberImageRepository
        }
      ],
    }).compile();

    memberService = module.get<MembersService>(MembersService);
    memberImageService = module.get<MemberImageService>(MemberImageService);
  });

  it('should be defined', () => {
    expect(memberService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a member object', async () => {
      const member = createMember({});
      mockMemberRepository.findOneOrFail.mockReturnValue(member);
      expect(await memberService.findOneById(member.id)).toEqual(member);
    });

    it('should throw an exception when no member with that id was found', async () => {
      expect.assertions(3);
      mockMemberRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await memberService.findOneById(0);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Member not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('findOneByEmail', () => {
    it('should return a member object', async () => {
      const member = createMember({});
      mockMemberRepository.findOneOrFail.mockReturnValue(member);
      expect(await memberService.findOneByEmail(member.email)).toEqual(member);
    });

    it('should throw an exception when no member with that mail was found', async () => {
      expect.assertions(3);
      mockMemberRepository.findOneOrFail.mockImplementation(() => {
        throw "findOneOrFail fails";
      });
      try {
        await memberService.findOneByEmail('test@example.com');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Member not found');
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });


  describe('checkForExistingUser', () => {
    it('should return truthy if member exists', async () => {
      const memberDto = createMemberDto({});
      mockMemberRepository.findOne.mockReturnValue(Promise.resolve({email: memberDto.email}));
      expect(await memberService.checkForExistingUser(memberDto.email)).toBeTruthy();
    });

    it('should return falsy if member does not exist', async () => {
      const memberDto = createMemberDto({});
      mockMemberRepository.findOne.mockReturnValue(Promise.resolve(undefined));
      expect(await memberService.checkForExistingUser(memberDto.email)).toBeFalsy();
    });
  });


  describe('create', () => {
    it('should return the saved Member', async () => {
      const member = createMember({});
      const memberDto = createMemberDto({});
      const memberServiceSpy = jest.spyOn(memberService, "checkForExistingUser");
      memberServiceSpy.mockReturnValue(Promise.resolve(undefined));
      mockMemberRepository.create.mockReturnValue(member);
      mockMemberRepository.save.mockReturnValue(member);
      expect(await memberService.create(memberDto)).toEqual(member);
    });

    it('should throw an Conflict Exception if the user already exists', async () => {
      const memberDto = createMemberDto({});
      expect.assertions(3);
      const memberServiceSpy = jest.spyOn(memberService, "checkForExistingUser");
      memberServiceSpy.mockReturnValue(Promise.resolve(true));

      try {
        await memberService.create(memberDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('User already exists');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should throw an BadRequest Exception if the user can not be saved', async () => {
      const memberDto = createMemberDto({});
      expect.assertions(2);
      const memberServiceSpy = jest.spyOn(memberService, "checkForExistingUser");
      memberServiceSpy.mockReturnValue(Promise.resolve(undefined));
      mockMemberRepository.create.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await memberService.create(memberDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });


  describe('update', () => {
    it('should return updated member', async () => {
      const member = createMember({});
      const returnMember = createMember({firstName: 'Bella'});
      const memberDto = createMemberDto({firstName: 'Bella'});
      mockMemberRepository.findOne.mockReturnValue(undefined);
      mockMemberRepository.findOne.mockReturnValue(member);
      mockMemberRepository.save.mockReturnValue(returnMember);

      expect(await memberService.update(member.id, memberDto)).toEqual(returnMember);
    });

    it('should throw an Conflict Exception if the email is already taken', async () => {
      expect.assertions(3);

      const member = createMember({});
      const memberDto = createMemberDto({firstName: 'Bella'});
      mockMemberRepository.findOne.mockReturnValue(member);

      try {
        await memberService.update(0, memberDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('Email already taken');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should not throw an Conflict Exception if email is from current user', async () => {
      const member = createMember({});
      const memberDto = createMemberDto({firstName: 'Bella'});
      mockMemberRepository.findOne.mockReturnValue(member);
      await memberService.update(member.id, memberDto);
      expect(mockMemberRepository.save).toBeCalledTimes(1);
    });

    it('should throw a Bad Request Exception when unable to save', async () => {
      expect.assertions(2);
      const member = createMember({});
      const memberDto = createMemberDto({});
      mockMemberRepository.findOne.mockReturnValue(undefined);
      mockMemberRepository.findOne.mockReturnValue(member);
      mockMemberRepository.save.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await memberService.update(member.id, memberDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });


  describe('setPassword', () => {
    it('should return member object with new password', async () => {
      const member = createMember({});
      const password = 'newPassword';
      const updatedMember = createMember({password: password});

      const memberServiceSpy = jest.spyOn(memberService, "findOneByEmail");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));
      mockMemberRepository.save.mockReturnValue(updatedMember);

      expect(await memberService.setPassword(member.email, password)).toEqual(updatedMember);
    });

    it('encrypt the new password', async () => {
      const member = createMember({});
      const password = 'newPassword';

      const memberServiceSpy = jest.spyOn(memberService, "findOneByEmail");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));

      const bcryptSpy = jest.spyOn(bcrypt, "hash");
      bcryptSpy.mockReturnValue(Promise.resolve('encrypted new Password'));

      await memberService.setPassword(member.email, password);
      expect(bcryptSpy).toBeCalledTimes(1);
    });

    it('should throw Exception when unable to update password', async () => {
      expect.assertions(3);

      const member = createMember({});
      const memberServiceSpy = jest.spyOn(memberService, "findOneByEmail");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));

      mockMemberRepository.save.mockImplementation(() => {
        throw "Can not save";
      });

      try {
        await memberService.setPassword(member.email, member.password);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not update password');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('deleteOneById', () => {
    it('should delete image before deleting member', async () => {
      const member = createMember({});
      member.profileImage = createImage({});

      const memberServiceSpy = jest.spyOn(memberService, "findOneById");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));

      const memberImageServiceSpy = jest.spyOn(memberImageService, "delete");
      memberImageServiceSpy.mockReturnValue(Promise.resolve(member.profileImage));

      mockMemberRepository.delete.mockReturnValue(member);
      await memberService.deleteOneById(member.id);
      expect(memberImageServiceSpy).toBeCalledTimes(1);
    });

   it('should return deleted member object', async () => {
      const member = createMember({});

      const memberServiceSpy = jest.spyOn(memberService, "findOneById");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));

      mockMemberRepository.delete.mockReturnValue(member);

      expect(await memberService.deleteOneById(member.id)).toEqual(member);
    });

    it('should throw Exception when unable to delete', async () => {
      expect.assertions(3);

      const member = createMember({});
      const memberServiceSpy = jest.spyOn(memberService, "findOneById");
      memberServiceSpy.mockReturnValue(Promise.resolve(member));

      mockMemberRepository.delete.mockImplementation(() => {
        throw "Can not delete";
      });

      try {
        await memberService.deleteOneById(member.id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not delete member profile');
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
