import {createAddress} from "./address.test.factory";

export const createProviderRepo = (
    {
        id = 1,
        name = 'TestProvider',
        email = 'test@example.com',
        password = 'geheim',
        description = 'Provider description',
        price = 0,
        contactPerson = 'Max Musterman',
        category = 'coding',
        courses = [],
        needsApproval = true,
        address = null,
        isPublished = true,
        profileImage = null,
        slideShow = []
    }) => {
    return {
        id, name, email, password, description, price, contactPerson, category, courses, slideShow,
        needsApproval, address, isPublished, profileImage,
    }
};

export const createProviderResponse = (
    {
        id = 1,
        name = 'TestProvider',
        email = 'test@example.com',
        password = 'geheim',
        description = 'Provider description',
        price = 0,
        contactPerson = 'Max Musterman',
        category = 'coding',
        courses = [],
        needsApproval = true,
        address = null,
        isPublished = true,
        profileImage = null,
        slideShow = []
    }) => {
    return {
        id, name, email, password, description, price, contactPerson, category, courses, slideShow,
        needsApproval, address, isPublished, profileImage,
        hashPassword: {},
        checkPassword: {},
        validate: {}
    }
};

export const createProvider = (
    {
        id = 1,
        name = 'TestProvider',
        email = 'test@example.com',
        password = 'geheim',
        description = 'Provider description',
        price = 0,
        contactPerson = 'Max Musterman',
        category = 'coding',
        courses = [],
        needsApproval = true,
        address = null,
        isPublished = true,
        profileImage = null,
        slideShow = []
    }) => {
    return {
        id, name, email, password, description, price, contactPerson, category, courses, slideShow,
        needsApproval, address, isPublished, profileImage,
        hashPassword: async () => {
            return
        },
        checkPassword: async () => {
            return true
        },
        validate: async () => {
            return
        }
    }
};

export const createProviderDto = (
    {
        name = 'TestProvider',
        email = 'test@example.com',
        password = 'geheim',
        description = 'Provider description',
        price = 0,
        contactPerson = 'Max Musterman',
        category = 'coding',
        address = createAddress({}),
        type = 'provider'
    }) => {
    return {
        name, email, password, description, price, contactPerson, category, address, type
    }
};
