import { ConnectionOptions } from 'typeorm';
import * as dbconfig from './config/db.config';

const config = {
  ...dbconfig,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
} as ConnectionOptions;

export = config;
