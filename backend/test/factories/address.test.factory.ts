import {createProvider} from "./provider.test.factory";

export const createAddress = (
    {
        id = 1,
        street = 'Test Straße 01',
        zip = '1010',
        city = 'Salzburg',
        country = 'Austria',
        provider = createProvider({})
    }) => {
    return {
        id, street, zip, city, country, provider,
        validate: async () => {
            return
        }
    }
}
