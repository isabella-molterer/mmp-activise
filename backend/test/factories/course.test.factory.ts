import {createProvider, createProviderRepo, createProviderResponse} from "./provider.test.factory";

export const createCourseResponse = (
    {
        id = 1, name = "nestjs",
        instructor = 'bella',
        email = 'test@example.com',
        description = 'learn coding',
        price = 0,
        category = 'coding',
        difficulty = 'easy',
        equipment = 'laptop',
        trialDay = true,
        maxParticipants = 10,
        isPrivate = false,
        isPublished = true,
        profileImage = null,
        provider = createProviderResponse({}),
        slideShow = []
    }) => {
    return {
        id, name, instructor, email, description, price, category, difficulty, equipment, trialDay, maxParticipants,
        isPrivate, isPublished, profileImage, provider, slideShow,
        validate: {}
    }
};




export const createCourse = (
    {
        id = 1, name = "nestjs",
        instructor = 'bella',
        email = 'test@example.com',
        description = 'learn coding',
        price = 0,
        category = 'coding',
        difficulty = 'easy',
        equipment = 'laptop',
        trialDay = true,
        maxParticipants = 10,
        isPrivate = false,
        isPublished = true,
        profileImage = null,
        provider = createProvider({}),
        slideShow = []
    }) => {
    return {
        id, name, instructor, email, description, price, category, difficulty, equipment, trialDay, maxParticipants,
        isPrivate, isPublished, profileImage, provider, slideShow,
        validate: async () => {
            return
        }
    }
};

export const createCourseDto = (
    {
        id = 1, 
        name = "nestjs",
        instructor = 'bella',
        email = 'test@example.com',
        description = 'learn coding',
        price = 0,
        category = 'coding',
        difficulty = 'easy',
        equipment = 'laptop',
        trialDay = true,
        maxParticipants = 10,
        isPrivate = false,
        isPublished = true,
        profileImage = null,
        provider = 1,
        slideShow = []
    }) => {
    return {
        id, name, instructor, email, description, price, category, difficulty, equipment, trialDay, maxParticipants,
        isPrivate, isPublished, profileImage, provider, slideShow,
    }
};

export const createCourseRepo = (
    {
        id = 1, 
        name = "nestjs",
        instructor = 'bella',
        email = 'test@example.com',
        description = 'learn coding',
        price = 0,
        category = 'coding',
        difficulty = 'easy',
        equipment = 'laptop',
        trialDay = true,
        maxParticipants = 10,
        isPrivate = false,
        isPublished = true,
        profileImage = null,
        provider = createProviderRepo({}),
        slideShow = []
    }) => {
    return {
        id, name, instructor, email, description, price, category, difficulty, equipment, trialDay, maxParticipants,
        isPrivate, isPublished, profileImage, provider, slideShow,
    }
};
