import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('groups', (table) => {
    table.uuid('id').primary()
    table.string('name', 64).notNullable()
    table.string('slug', 64).notNullable().unique()
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('groups')
}

