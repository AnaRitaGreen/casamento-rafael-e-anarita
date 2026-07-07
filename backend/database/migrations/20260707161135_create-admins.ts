import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('admins', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid())
    table.string('username', 16).notNullable().unique()
    table.string('password_hash', 255).notNullable()
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('admins')
}

