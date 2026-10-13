import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('guests', 'buffet_status')
  if (!hasColumn) {
    await knex.schema.alterTable('guests', (table) => {
      table
        .string('buffet_status', 20)
        .notNullable()
        .defaultTo('inteira')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('guests', 'buffet_status')
  if (hasColumn) {
    await knex.schema.alterTable('guests', (table) => {
      table.dropColumn('buffet_status')
    })
  }
}
