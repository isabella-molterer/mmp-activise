export const createMemberDto = (
    {
        firstName = 'Jane',
        lastName = 'Doe',
        email = 'test@example.com',
        birthday = '01-01-2020',
        type = 'member'
    }) => {
    return {
        firstName, lastName, email, birthday, type
    }
};

export const createMember = (
    {
        id = 1,
        firstName = 'Jane',
        lastName = 'Doe',
        email = 'test@example.com',
        birthday = new Date('01-01-2020'),
        password = 'geheim!',
        profileImage = null,
        checkPassword = true
    }) => {
    return {
        id, firstName, lastName, email, birthday, password, profileImage,
        hashPassword: async () => {
            return
        },
        checkPassword: async () => {
            return checkPassword
        },
        validate: async () => {
            return
        }
    }
};
