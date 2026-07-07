import pkg from 'knex'
import type { Knex } from 'knex'
import { env } from './env/index.ts'

const { knex: setupKnex } = pkg

export const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
  seeds: {
    extension: 'ts',
    directory: './database/seeds',
  },
}

export const knex = setupKnex(config)