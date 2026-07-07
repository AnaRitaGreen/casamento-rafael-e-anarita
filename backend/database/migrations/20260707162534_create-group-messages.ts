import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('group_messages', (table) => {
    table.uuid('id').primary()
    table.uuid('group_id').notNullable().references('id').inTable('groups').onDelete('CASCADE')
    table.text('message').notNullable()
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('group_messages')
}

