import {createCourseImage} from "../../factories/images.test.factory";
import {RolesCourseGuard} from "../../../src/auth/roles/rolesCourse.guard";
import {createCourse} from "../../factories/course.test.factory";
import {createProvider} from "../../factories/provider.test.factory";

describe('RolesCourse guard', () => {
    let guard: RolesCourseGuard, roles, id, request, course, image, slideshow, provider;
    beforeEach( () => {
        guard = new RolesCourseGuard(null, null, null);
        roles = ['editOwnCourse', 'createOwnCourse', 'editImagesCourses', 'getOwnCourse', 'deleteOwnCourse', 'uploadImageCourse'];
        id = 1;
        request = {params: {id: id, imageid: id, linkid: id}, body: {id: id, provider: id}};
        provider = createProvider({id: id});
        image = createCourseImage({});
        slideshow = [image, image];
        course = createCourse({provider: provider, slideShow: slideshow});
    });

    describe('providerCreateOwnCourse', () => {
        it('should return true, if role is createOwnCourse and request provider id equals user id', () => {
            expect(guard.providerCreateOwnCourse(roles, request, provider)).toBeTruthy();
        });
        it('should return false, if role is createOwnCourse but request provider id does not equal user id', () => {
            provider.id = provider.id + 1;
            expect(guard.providerCreateOwnCourse(roles, request, provider)).toBeFalsy();
        });
    });

    describe('providerGetOrDeleteCourseDetails', () => {
        it('should return true, if role is getOwnCourse and course provider id equals user id', () => {
            expect(guard.providerGetOrDeleteCourseDetails(roles, course, provider)).toBeTruthy();
        });
        it('should return false, if role is deleteOwnCourse but the user id does not match', () => {
            provider = createProvider({id: provider.id + 1});
            expect(guard.providerGetOrDeleteCourseDetails(roles, course, provider)).toBeFalsy();
        });
    });

    describe('providerEditOwnCourse', () => {
        it('should return true, if role is editOwnCourse and link was found course, user and request have matching values', () => {
            expect(guard.providerEditOwnCourse(roles, course, provider, request)).toBeTruthy();
        });
    });
});
