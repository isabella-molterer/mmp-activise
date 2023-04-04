import {RolesMemberGuard} from "../../../src/auth/roles/rolesMember.guard";

describe('RolesMember guard', () => {
    let guard: RolesMemberGuard, roles, id, request, user;
    beforeEach( () => {
        guard = new RolesMemberGuard(null);
        roles = ['editMember', 'updateMember', 'getProfile'],
        id = 1,
        request = {params: {id: id}, body: {id: id}},
        user = {id: id};
    });

    describe('memberEditMember', () => {
        it('should return true, if role is editMember and request params id equals user id', () => {
            expect(guard.memberEditMember(roles, request, user)).toBeTruthy();
        });
        it('should return false, if role is editMember but request id does not equal user id', () => {
            user.id = user.id + 1;
            expect(guard.memberEditMember(roles, request, user)).toBeFalsy();
        });
    });

    describe('memberUpdateMember', () => {
        it('should return true, if role is updateMember and request params id equals user id and the request body id equals user id', () => {
            expect(guard.memberUpdateMember(roles, request, user)).toBeTruthy();
        });
        it('should return false, if role is updateMember but the user id does not match', () => {
            user.id = user.id + 1;
            expect(guard.memberUpdateMember(roles, request, user)).toBeFalsy();
        });
    });
});
