import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    table.uuid('table_id').nullable().references('id').inTable('tables').onDelete('SET NULL')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    table.dropColumn('table_id')
  })
}
