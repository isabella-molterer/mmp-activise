import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenCascades1589271151590 implements MigrationInterface {
  name = 'AddTokenCascades1589271151590';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP FOREIGN KEY `FK_ef43b1d77fe3fdc2630ebffe4f3`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` DROP FOREIGN KEY `FK_040ba122204a297972ad612a763`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL DEFAULT null',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD CONSTRAINT `FK_ef43b1d77fe3fdc2630ebffe4f3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD CONSTRAINT `FK_040ba122204a297972ad612a763` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `provider_token` DROP FOREIGN KEY `FK_040ba122204a297972ad612a763`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP FOREIGN KEY `FK_ef43b1d77fe3fdc2630ebffe4f3`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD CONSTRAINT `FK_040ba122204a297972ad612a763` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD CONSTRAINT `FK_ef43b1d77fe3fdc2630ebffe4f3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }
}
