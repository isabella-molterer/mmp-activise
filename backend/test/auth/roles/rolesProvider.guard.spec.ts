import {RolesProviderGuard} from "../../../src/auth/roles/rolesProvider.guard";
import {ProviderImagesService} from "../../../src/images/provider-images.service";
import {createProviderImage} from "../../factories/images.test.factory";
import {createProvider} from "../../factories/provider.test.factory";
import {createLink} from "../../factories/link.test.factory";
import {LinksService} from "../../../src/links/links.service";
import {MockService} from "../../mocks/mock-service";

describe('RolesProvider guard', () => {
    let guard: RolesProviderGuard, roles, id, request, providerImage, provider, providerLink;
    beforeEach( () => {
        guard = new RolesProviderGuard(null, null, null);
        roles = ['editProvider', 'updateProvider', 'editImageProvider', 'deleteLinkProvider'];
        id = 1;
        request = {params: {id: id, imageid: id, linkid: id}, body: {id: id}};
        provider = createProvider({id: id});
        providerImage = createProviderImage({id: id, provider: provider});
        providerLink = createLink({id: id, provider: provider});
    });

    describe('providerEditProvider', () => {
        it('should return true, if role is editProvider and request params id equals user id', () => {
            expect(guard.providerEditProvider(roles, request, provider)).toBeTruthy();
        });
        it('should return false, if role is editProvider but request id does not equal user id', () => {
            provider.id = provider.id + 1;
            expect(guard.providerEditProvider(roles, request, provider)).toBeFalsy();
        });
    });

    describe('providerUpdateProvider', () => {
        it('should return true, if role is updateProvider and request params id equals user id and the request body id equals user id', () => {
            expect(guard.providerUpdateProvider(roles, request, provider)).toBeTruthy();
        });
        it('should return false, if role is updateProvider but the user id does not match', () => {
            provider.id = provider.id + 1;
            expect(guard.providerUpdateProvider(roles, request, provider)).toBeFalsy();
        });
    });

   xdescribe('providerEditImageProvider', () => {
        it('should return true, if role is editImageProvider and image was found request params id equals user id and user id equals image provider id', () => {
            const providerImagesService = new ProviderImagesService(null);
            const imageSpy = jest.spyOn(providerImagesService, 'findOneById');
            imageSpy.mockReturnValue(Promise.resolve(providerImage));
            expect(guard.providerEditImageProvider(roles, request, provider)).toBeTruthy();
        });
    });

    xdescribe('providerDeleteLinkProvider', () => {
        it('should return true, if role is deleteLinkProvider and link was found request params id equals user id and user id equals link provider id', () => {
            const linksService = new MockService<LinksService>();
            const linkSpy = jest.spyOn(linksService, 'findOneById');
            linkSpy.mockReturnValue(Promise.resolve(providerLink));
            expect(guard.providerDeleteLinkProvider(roles, request, provider)).toBeTruthy();
        });
    });
});
