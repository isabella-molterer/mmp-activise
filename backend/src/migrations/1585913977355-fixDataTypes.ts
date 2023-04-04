import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixDataTypes1585913977355 implements MigrationInterface {
  name = 'fixDataTypes1585913977355';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `course_date` DROP FOREIGN KEY `FK_aa50510949571162e4071a19203`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` DROP FOREIGN KEY `FK_0e08ee6a8476296b401fdf6ab9e`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` CHANGE `from` `from` timestamp NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` CHANGE `to` `to` timestamp NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` CHANGE `addressId` `addressId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` CHANGE `courseId` `courseId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_185d1e711a04ff46505951caf45`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD `email` varchar(65) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP COLUMN `password`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD `password` varchar(255) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_4678079964ab375b2b31849456` ON `member`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD `email` varchar(65) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD UNIQUE INDEX `IDX_4678079964ab375b2b31849456` (`email`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` DROP FOREIGN KEY `FK_26bb54a5f46b9210320703e9fcb`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_92771edc46a8f06892ed72cdf4` ON `provider`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD `email` varchar(65) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD UNIQUE INDEX `IDX_92771edc46a8f06892ed72cdf4` (`email`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP FOREIGN KEY `FK_c0304246aaf83f8e2c7ddae4db5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP COLUMN `street`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD `street` varchar(100) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP COLUMN `city`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD `city` varchar(35) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_aa50510949571162e4071a19203` FOREIGN KEY (`addressId`) REFERENCES `address`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_0e08ee6a8476296b401fdf6ab9e` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_185d1e711a04ff46505951caf45` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_26bb54a5f46b9210320703e9fcb` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD CONSTRAINT `FK_c0304246aaf83f8e2c7ddae4db5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `address` DROP FOREIGN KEY `FK_c0304246aaf83f8e2c7ddae4db5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` DROP FOREIGN KEY `FK_26bb54a5f46b9210320703e9fcb`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_185d1e711a04ff46505951caf45`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` DROP FOREIGN KEY `FK_0e08ee6a8476296b401fdf6ab9e`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` DROP FOREIGN KEY `FK_aa50510949571162e4071a19203`',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `address` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP COLUMN `city`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD `city` varchar(25) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP COLUMN `street`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD `street` varchar(50) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD CONSTRAINT `FK_c0304246aaf83f8e2c7ddae4db5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP INDEX `IDX_92771edc46a8f06892ed72cdf4`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD `email` varchar(50) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_92771edc46a8f06892ed72cdf4` ON `provider` (`email`)',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `link` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_26bb54a5f46b9210320703e9fcb` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP INDEX `IDX_4678079964ab375b2b31849456`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD `email` varchar(50) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_4678079964ab375b2b31849456` ON `member` (`email`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP COLUMN `password`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD `password` varchar(50) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD `email` varchar(50) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_185d1e711a04ff46505951caf45` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course_date` CHANGE `courseId` `courseId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course_date` CHANGE `addressId` `addressId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course_date` CHANGE `to` `to` timestamp NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course_date` CHANGE `from` `from` timestamp NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_0e08ee6a8476296b401fdf6ab9e` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_aa50510949571162e4071a19203` FOREIGN KEY (`addressId`) REFERENCES `address`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }
}
