import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tables', (table) => {
    table.uuid('id').primary()
    table.integer('table_number').notNullable().unique()
    table.integer('capacity').notNullable().defaultTo(8)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tables')
}
