import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinTableAnnotationToCourseEntity1589826642858
  implements MigrationInterface {
  name = 'AddJoinTableAnnotationToCourseEntity1589826642858';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `course_members_member` (`courseId` int NOT NULL, `memberId` int NOT NULL, INDEX `IDX_3604ee682cce67c8677f2229e9` (`courseId`), INDEX `IDX_a5c3e057325bff146b22a3a235` (`memberId`), PRIMARY KEY (`courseId`, `memberId`)) ENGINE=InnoDB',
      undefined,
    );
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
      'ALTER TABLE `course_images` DROP FOREIGN KEY `FK_cb3b7c0000fe2852eb9ac290b07`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_images` CHANGE `courseId` `courseId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_185d1e711a04ff46505951caf45`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_f3715ccea3ac76c3f7e4e844a15`',
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
      'ALTER TABLE `course` CHANGE `profileImageId` `profileImageId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP FOREIGN KEY `FK_ef43b1d77fe3fdc2630ebffe4f3`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` CHANGE `memberId` `memberId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP FOREIGN KEY `FK_7468f42e33e79d30fc83eea33e7`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL DEFAULT null',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` CHANGE `profileImageId` `profileImageId` int NULL',
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
      'ALTER TABLE `provider_images` DROP FOREIGN KEY `FK_53321f5f6ad2282251c190872a5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_images` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` DROP FOREIGN KEY `FK_040ba122204a297972ad612a763`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP FOREIGN KEY `FK_d01838ce93b4508b98f8b0e5294`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `profileImageId` `profileImageId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP FOREIGN KEY `FK_c0304246aaf83f8e2c7ddae4db5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` CHANGE `providerId` `providerId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_aa50510949571162e4071a19203` FOREIGN KEY (`addressId`) REFERENCES `address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_0e08ee6a8476296b401fdf6ab9e` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_images` ADD CONSTRAINT `FK_cb3b7c0000fe2852eb9ac290b07` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_185d1e711a04ff46505951caf45` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_f3715ccea3ac76c3f7e4e844a15` FOREIGN KEY (`profileImageId`) REFERENCES `course_images`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD CONSTRAINT `FK_ef43b1d77fe3fdc2630ebffe4f3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD CONSTRAINT `FK_7468f42e33e79d30fc83eea33e7` FOREIGN KEY (`profileImageId`) REFERENCES `member_image`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_26bb54a5f46b9210320703e9fcb` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_images` ADD CONSTRAINT `FK_53321f5f6ad2282251c190872a5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD CONSTRAINT `FK_040ba122204a297972ad612a763` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD CONSTRAINT `FK_d01838ce93b4508b98f8b0e5294` FOREIGN KEY (`profileImageId`) REFERENCES `provider_images`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD CONSTRAINT `FK_c0304246aaf83f8e2c7ddae4db5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_members_member` ADD CONSTRAINT `FK_3604ee682cce67c8677f2229e92` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_members_member` ADD CONSTRAINT `FK_a5c3e057325bff146b22a3a2359` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `course_members_member` DROP FOREIGN KEY `FK_a5c3e057325bff146b22a3a2359`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_members_member` DROP FOREIGN KEY `FK_3604ee682cce67c8677f2229e92`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` DROP FOREIGN KEY `FK_c0304246aaf83f8e2c7ddae4db5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP FOREIGN KEY `FK_d01838ce93b4508b98f8b0e5294`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` DROP FOREIGN KEY `FK_040ba122204a297972ad612a763`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_images` DROP FOREIGN KEY `FK_53321f5f6ad2282251c190872a5`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` DROP FOREIGN KEY `FK_26bb54a5f46b9210320703e9fcb`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` DROP FOREIGN KEY `FK_7468f42e33e79d30fc83eea33e7`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` DROP FOREIGN KEY `FK_ef43b1d77fe3fdc2630ebffe4f3`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_f3715ccea3ac76c3f7e4e844a15`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` DROP FOREIGN KEY `FK_185d1e711a04ff46505951caf45`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_images` DROP FOREIGN KEY `FK_cb3b7c0000fe2852eb9ac290b07`',
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
      'ALTER TABLE `address` ADD CONSTRAINT `FK_c0304246aaf83f8e2c7ddae4db5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `provider` CHANGE `profileImageId` `profileImageId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` CHANGE `price` `price` decimal(10,0) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD CONSTRAINT `FK_d01838ce93b4508b98f8b0e5294` FOREIGN KEY (`profileImageId`) REFERENCES `provider_images`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `provider_token` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE current_timestamp()',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_token` ADD CONSTRAINT `FK_040ba122204a297972ad612a763` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `provider_images` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `provider_images` ADD CONSTRAINT `FK_53321f5f6ad2282251c190872a5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `link` CHANGE `providerId` `providerId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_26bb54a5f46b9210320703e9fcb` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `member` CHANGE `profileImageId` `profileImageId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `member` CHANGE `birthday` `birthday` date NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member` ADD CONSTRAINT `FK_7468f42e33e79d30fc83eea33e7` FOREIGN KEY (`profileImageId`) REFERENCES `member_image`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `member_token` CHANGE `memberId` `memberId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` CHANGE `expiresAt` `expiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE current_timestamp()',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_token` ADD CONSTRAINT `FK_ef43b1d77fe3fdc2630ebffe4f3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course` CHANGE `profileImageId` `profileImageId` int NULL DEFAULT 'NULL'",
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
      'ALTER TABLE `course` ADD CONSTRAINT `FK_f3715ccea3ac76c3f7e4e844a15` FOREIGN KEY (`profileImageId`) REFERENCES `course_images`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_185d1e711a04ff46505951caf45` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `course_images` CHANGE `courseId` `courseId` int NULL DEFAULT 'NULL'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_images` ADD CONSTRAINT `FK_cb3b7c0000fe2852eb9ac290b07` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
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
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_0e08ee6a8476296b401fdf6ab9e` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_aa50510949571162e4071a19203` FOREIGN KEY (`addressId`) REFERENCES `address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_a5c3e057325bff146b22a3a235` ON `course_members_member`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_3604ee682cce67c8677f2229e9` ON `course_members_member`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `course_members_member`', undefined);
  }
}
