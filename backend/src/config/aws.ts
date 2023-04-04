import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeleteObjectRequest } from 'aws-sdk/clients/s3';
import { ProviderImages } from '../images/provider-images.entity';
import { CourseImages } from '../images/course-images.entity';
import { MemberImage } from '../images/member-image.entity';

export type Fileoptions = {
  buffer: Buffer;
  mimetype: string;
};

export class Aws {
  static createConnection() {
    AWS.config.update({
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ID,
      secretAccessKey: process.env.S3_SECRET,
    });
    return new AWS.S3();
  }

  static getParamsForAws(image: ProviderImages | CourseImages | MemberImage) {
    return {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: image.key,
    };
  }

  static generateFileParams(file: Fileoptions, id: number, type: string) {
    const fileextension = '.' + file.mimetype.split('/').pop();
    const filename = type + '/' + uuid.v4() + id + fileextension;
    const fileurl =
      'https://' +
      process.env.S3_BUCKET_NAME +
      '.s3.' +
      process.env.S3_REGION +
      '.amazonaws.com/' +
      filename;

    return {
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Body: file.buffer,
        Key: filename,
        ACL: process.env.S3_FILE_PERMISSION,
      },
      fileurl: fileurl,
      filename: filename,
    };
  }

  static async uploadFileToS3(file: Fileoptions, id: number, type: string) {
    const awsParams = this.generateFileParams(file, id, type);
    try {
      await this.createConnection()
        .putObject(awsParams.params)
        .promise();
      return awsParams;
    } catch (e) {
      throw new HttpException(
        'Could not upload image to aws',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  static async deleteFileFromAws(params: DeleteObjectRequest) {
    const s3 = this.createConnection();
    try {
      await s3.headObject(params).promise();
      await s3.deleteObject(params).promise();
    } catch (err) {
      throw new HttpException(
        'Could not delete image from aws',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
