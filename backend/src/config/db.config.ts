import { DatabaseType } from 'typeorm';
import { ConnectionString } from 'connection-string';

const cs = new ConnectionString(
  process.env.DATABASE_URL || 'mysql://root@localhost:3306/activise',
);

const dbconfig = {
  type: cs.protocol as DatabaseType,
  host: cs.hostname,
  port: cs.port,
  username: cs.user,
  password: cs.password,
  database: cs.path && cs.path[0],
  migrationsRun: false,
  synchronize: false,
  // Run migrations automatically,
  logging: true,
  logger: 'file',
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
};

export = dbconfig;
