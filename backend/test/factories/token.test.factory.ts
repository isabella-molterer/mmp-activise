import { createMember } from "./member.test.factory"
import { createProvider } from "./provider.test.factory"
import {jwtConstants} from "../../src/auth/constants"
import moment = require("moment")

export const createTokenPair = (
    {
        accessToken = 'accessToken',
        refreshToken = 'refreshToken'
    }) => {
    return {
        accessToken,
        refreshToken
    }
}

export const createMemberToken = (
    {
        id = 1,
        token = 'token',
        expiresAt = moment().add(jwtConstants.refreshDefaultExpiration, 's').toDate(),
        member = createMember({})
    }) => {
    return {
        id,
        token,
        expiresAt,
        member
    }
}

export const createProviderToken = (
    {
        id = 1,
        token = 'token',
        expiresAt = moment().add(jwtConstants.refreshDefaultExpiration, 's').toDate(),
        provider = createProvider({})
    }) => {
    return {
        id,
        token,
        expiresAt,
        provider
    }
}

export const createPayload = (
    {
        id = 1,
        email = 'test@example.com',
        type = 'member',
        expirationTime = jwtConstants.accessDefaultExpiration
    }) => {
    return {
        id,
        email,
        type,
        expirationTime
    }
}