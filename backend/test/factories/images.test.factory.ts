import {createMember} from "./member.test.factory";
import {createProvider} from "./provider.test.factory";
import {createCourse, createCourseRepo} from "./course.test.factory";

export const createImage = (
    {
        id = 1,
        url = "example.com",
        key = "key number"
    }) => {
    return {
        id, url, key,
        validate: async () => {
            return
        }
    }
};

export const createMemberImage = (
    {
        id = 1,
        url = "example.com",
        key = "key number",
        profileImage = createMember({})
    }) => {
    return {
        id, url, key, profileImage,
        validate: async () => {
            return
        }
    }
};

export const createProviderImage = (
    {
        id = 1,
        url = "example.com",
        key = "key number",
        profileImage = createProvider({}),
        provider = createProvider({})
    }) => {
    return {
        id, url, key, profileImage, provider,
        validate: async () => {
            return
        }
    }
};

export const createCourseImage = (
    {
        id = 1,
        url = "example.com",
        key = "key number",
        profileImage = createCourse({}),
        course = createCourse({})
    }) => {
    return {
        id, url, key, profileImage, course,
        validate: async () => {
            return
        }
    }
};

export const createCourseImageRepo = (
    {
        id = 1,
        url = "example.com",
        key = "key number",
        profileImage = createCourseRepo({}),
        course = createCourseRepo({})
    }) => {
    return {
        id, url, key, profileImage, course,
    }
};