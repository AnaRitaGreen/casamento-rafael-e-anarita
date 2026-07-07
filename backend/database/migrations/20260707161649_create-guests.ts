import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('guests', (table) => {
    table.uuid('id').primary()
    table.uuid('group_id').notNullable().references('id').inTable('groups').onDelete('CASCADE')
    table.string('name', 64).notNullable()
    table.boolean('is_child').notNullable().defaultTo(false)
    table.boolean('confirmed').notNullable().defaultTo(false)
    table.date('confirmed_at')
    table.string('restriction', 255)
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('guests')
}

