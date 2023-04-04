import {Aws} from "../../src/config/aws";
import {createFileOptions} from "../factories/aws.test.factory";

describe('Aws', () => {

    beforeEach(async () => {
        process.env.S3_BUCKET_NAME = 'testing';
        process.env.S3_REGION = 'home';
        process.env.S3_FILE_PERMISSION = 'aws-rights';

    });

    describe('generateFileParams', () => {
        it('should return Parameter Objects', () => {
            const fileOptions = createFileOptions({});
            const fileParams = Aws.generateFileParams(fileOptions, 1, 'test');

            expect(fileParams.params).toHaveProperty('Bucket', process.env.S3_BUCKET_NAME);
            expect(fileParams.params).toHaveProperty('Body', fileOptions.buffer);
            expect(fileParams.params).toHaveProperty('Key');
            expect(fileParams.params).toHaveProperty('ACL',  process.env.S3_FILE_PERMISSION);

            expect(fileParams).toHaveProperty('fileurl');
            expect(fileParams).toHaveProperty('filename');

            expect(fileParams.params.Key).toEqual(fileParams.filename);

        });
    });
});
