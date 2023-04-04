import {createProvider} from "./provider.test.factory";

export const createLink = (
    {
        id = 1,
        linkText = 'Example Text',
        url = 'www.example.com',
        provider = createProvider({})
    }) => {
    return {
        id, linkText, url, provider
    }
}
