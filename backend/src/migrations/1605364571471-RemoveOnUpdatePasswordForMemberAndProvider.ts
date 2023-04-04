import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOnUpdatePasswordForMemberAndProvider1605364571471
  implements MigrationInterface {
  name = 'RemoveOnUpdatePasswordForMemberAndProvider1605364571471';

  public async up(queryRunner: QueryRunner): Promise<any> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
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
  }
}
