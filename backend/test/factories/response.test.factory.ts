import {HttpStatus} from "@nestjs/common";

export const createSuccessResponse = (
    {
        statusCode = HttpStatus.OK,
        message = 'Profile got deleted successfully'
    }) => {
    return {
        statusCode, message
    }
};
