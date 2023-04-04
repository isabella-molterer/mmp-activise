import { createAddress } from "./address.test.factory";

export const createRegisterProviderDto = (
    {
        name = 'TestProvider',
        email = 'test@example.com',
        password = 'geheim!',
        description = 'Provider description',
        contactPerson = 'Max Musterman',
        phoneNumber = '0660 1234 567',
        price = 0,
        category = 'coding',
        type = 'provider',
        links = [],
        address = createAddress({}),
    }) => {
    return {
        name, email, password, description, contactPerson, phoneNumber, price, category, type, links, address
    }
};

export const createRegisterMemberDto = (
    {
        email = 'test@example.com',
        firstName = 'Jane',
        lastName = 'Doe',
        password = 'geheim!',
        birthday = null,
        type = 'member',
    }) => {
    return {
        email, firstName, lastName, password, birthday, type
    }
};

export const createUserDto = (
    {
        email = 'test@example.com',
        password = 'geheim!',
        type = 'member'
    }) => {
    return {
        email, password, type
    }
};

export const createResetPasswordDto = (
    {
        email = 'test@example.com',
        newPassword = 'geheim!',
        currentPassword = 'test',
        newPasswordToken = 'token',
        type = 'member'
    }) => {
    return {
        email,
        newPassword,
        currentPassword,
        newPasswordToken,
        type
    }
};

export const createEmailTypeObject = (
    {
        email = 'test@example.com',
        type = 'member'
    }) => {
    return {
        email,
        type
    }
}