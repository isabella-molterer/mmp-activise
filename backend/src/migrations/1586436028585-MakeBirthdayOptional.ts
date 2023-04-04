import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBirthdayOptional1586436028585 implements MigrationInterface {
  name = 'MakeBirthdayOptional1586436028585';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL DEFAULT null',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
  }
}
