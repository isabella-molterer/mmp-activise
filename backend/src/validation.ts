import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';

export class Validation {
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validate(this).then(errors => {
      if (errors.length > 0) {
        throw new HttpException(errors, HttpStatus.BAD_REQUEST);
      }
    });
  }
}
