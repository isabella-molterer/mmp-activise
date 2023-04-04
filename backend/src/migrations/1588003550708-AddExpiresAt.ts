import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiresAt1588003550708 implements MigrationInterface {
  name = 'AddExpiresAt1588003550708';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD UNIQUE INDEX `IDX_bc31945303f4dafb31e8fc65d4` (`token`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL DEFAULT null',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD UNIQUE INDEX `IDX_a7fe7ff2e04739cfef2189a2fa` (`token`)',
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
      'ALTER TABLE `provider_token` DROP INDEX `IDX_a7fe7ff2e04739cfef2189a2fa`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP INDEX `IDX_bc31945303f4dafb31e8fc65d4`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` DROP COLUMN `expiresAt`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP COLUMN `expiresAt`',
      undefined,
    );
  }
}
