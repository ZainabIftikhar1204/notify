/* eslint-disable prettier/prettier */
const config=require('config');
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const postgresDbConfig = config.get('database.postgresdb.connection');
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: postgresDbConfig.database,
      user: postgresDbConfig.user,
      password: postgresDbConfig.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
      tableName: 'knex_migrations',
    },
    debug: false, 
  },
};
