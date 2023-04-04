import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokenEntities1587989710135 implements MigrationInterface {
  name = 'CreateTokenEntities1587989710135';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `member_token` (`id` int NOT NULL AUTO_INCREMENT, `token` varchar(255) NOT NULL, `memberId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `provider_token` (`id` int NOT NULL AUTO_INCREMENT, `token` varchar(255) NOT NULL, `providerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
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
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD CONSTRAINT `FK_ef43b1d77fe3fdc2630ebffe4f3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD CONSTRAINT `FK_040ba122204a297972ad612a763` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
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
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query('DROP TABLE `provider_token`', undefined);
    await queryRunner.query('DROP TABLE `member_token`', undefined);
  }
}
