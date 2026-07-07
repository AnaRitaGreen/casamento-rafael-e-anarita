import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('gifts', (table) => {
    table.uuid('id').primary()
    table.string('title', 128).notNullable()
    table.string('description', 255)
    table.string('link', 255)
    table.string('image', 255)
    table.decimal('value', 10, 2).notNullable().defaultTo(0)
    table.boolean('reserved').notNullable().defaultTo(false)
    table.uuid('reserved_by').references('id').inTable('guests').onDelete('CASCADE').onUpdate('CASCADE')
    table.date('reserved_at')
    table.timestamps(true, true)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('gifts')
}

