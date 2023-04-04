export const createFileOptions = (
    {
        buffer = 'test',
        mimetype = 'image/JPG'
    }) => {
    return {
        buffer: Buffer.from(buffer),
        mimetype
    }
};

export const createGetParamsForAws = (
    {
        Bucket = 'TestBucket',
        Key = 'Aws Key'
    }) => {
    return {
        Bucket,
        Key
    }
};

export const createGenerateTestFileparams = (
    {
        Bucket = process.env.S3_BUCKET_NAME,
        Body = createFileOptions({}).buffer,
        Key = '',
        ACL = process.env.S3_FILE_PERMISSION,
        fileurl = '',
        filename = ''
    }) => {
    return {
        params: {
            Bucket,
            Body,
            Key,
            ACL
        }, fileurl, filename
    }
};
