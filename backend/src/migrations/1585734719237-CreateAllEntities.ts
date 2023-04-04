import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllEntities1585734719237 implements MigrationInterface {
  name = 'CreateAllEntities1585734719237';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `course_date` (`id` int NOT NULL AUTO_INCREMENT, `from` timestamp NULL, `to` timestamp NULL, `addressId` int NULL, `courseId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `course` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, `instructor` varchar(50) NOT NULL, `description` varchar(255) NOT NULL, `price` decimal NOT NULL, `category` varchar(25) NOT NULL, `difficulty` varchar(25) NOT NULL, `equipment` varchar(255) NOT NULL, `requirements` varchar(255) NOT NULL, `trialDay` tinyint NOT NULL, `isPrivate` tinyint NOT NULL, `isPublished` tinyint NOT NULL DEFAULT 0, `providerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `member` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(25) NOT NULL, `lastName` varchar(25) NOT NULL, `password` varchar(50) NOT NULL, `email` varchar(50) NOT NULL, `birthday` date NOT NULL, UNIQUE INDEX `IDX_4678079964ab375b2b31849456` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `link` (`id` int NOT NULL AUTO_INCREMENT, `linkText` varchar(50) NOT NULL, `url` varchar(255) NOT NULL, `providerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `provider` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, `email` varchar(50) NOT NULL, `password` varchar(50) NOT NULL, `description` varchar(255) NOT NULL, `price` decimal NOT NULL, `contactPerson` varchar(25) NOT NULL, `phoneNumber` varchar(25) NOT NULL, `category` varchar(25) NOT NULL, `isPrivate` tinyint NOT NULL, `isPublished` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX `IDX_92771edc46a8f06892ed72cdf4` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `address` (`id` int NOT NULL AUTO_INCREMENT, `street` varchar(50) NOT NULL, `zip` varchar(25) NOT NULL, `city` varchar(25) NOT NULL, `country` varchar(25) NOT NULL, `providerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `member_providers_provider` (`memberId` int NOT NULL, `providerId` int NOT NULL, INDEX `IDX_7edbb57930fcba129bebcd676d` (`memberId`), INDEX `IDX_55b530bb6ba1c690bc0e54f631` (`providerId`), PRIMARY KEY (`memberId`, `providerId`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'CREATE TABLE `member_courses_course` (`memberId` int NOT NULL, `courseId` int NOT NULL, INDEX `IDX_a29ad077bdf264696ba611d839` (`memberId`), INDEX `IDX_f2ec9fd3a4afdc64a50cc1786e` (`courseId`), PRIMARY KEY (`memberId`, `courseId`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_aa50510949571162e4071a19203` FOREIGN KEY (`addressId`) REFERENCES `address`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course_date` ADD CONSTRAINT `FK_0e08ee6a8476296b401fdf6ab9e` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `course` ADD CONSTRAINT `FK_185d1e711a04ff46505951caf45` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `link` ADD CONSTRAINT `FK_26bb54a5f46b9210320703e9fcb` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `address` ADD CONSTRAINT `FK_c0304246aaf83f8e2c7ddae4db5` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_providers_provider` ADD CONSTRAINT `FK_7edbb57930fcba129bebcd676d3` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_providers_provider` ADD CONSTRAINT `FK_55b530bb6ba1c690bc0e54f631c` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_courses_course` ADD CONSTRAINT `FK_a29ad077bdf264696ba611d8395` FOREIGN KEY (`memberId`) REFERENCES `member`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_courses_course` ADD CONSTRAINT `FK_f2ec9fd3a4afdc64a50cc1786e0` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `member_courses_course` DROP FOREIGN KEY `FK_f2ec9fd3a4afdc64a50cc1786e0`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_courses_course` DROP FOREIGN KEY `FK_a29ad077bdf264696ba611d8395`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_providers_provider` DROP FOREIGN KEY `FK_55b530bb6ba1c690bc0e54f631c`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `member_providers_provider` DROP FOREIGN KEY `FK_7edbb57930fcba129bebcd676d3`',
      undefined,
    );
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
      'DROP INDEX `IDX_f2ec9fd3a4afdc64a50cc1786e` ON `member_courses_course`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_a29ad077bdf264696ba611d839` ON `member_courses_course`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `member_courses_course`', undefined);
    await queryRunner.query(
      'DROP INDEX `IDX_55b530bb6ba1c690bc0e54f631` ON `member_providers_provider`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_7edbb57930fcba129bebcd676d` ON `member_providers_provider`',
      undefined,
    );
    await queryRunner.query(
      'DROP TABLE `member_providers_provider`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `address`', undefined);
    await queryRunner.query(
      'DROP INDEX `IDX_92771edc46a8f06892ed72cdf4` ON `provider`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `provider`', undefined);
    await queryRunner.query('DROP TABLE `link`', undefined);
    await queryRunner.query(
      'DROP INDEX `IDX_4678079964ab375b2b31849456` ON `member`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `member`', undefined);
    await queryRunner.query('DROP TABLE `course`', undefined);
    await queryRunner.query('DROP TABLE `course_date`', undefined);
  }
}
