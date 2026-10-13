import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('settings')
  if (!hasTable) {
    await knex.schema.createTable('settings', (table) => {
      table.string('key', 64).primary()
      table.text('value').notNullable()
      table.timestamps(true, true)
    })

    await knex('settings').insert([
      { key: 'buffet_free_max_age', value: '5' },
      { key: 'buffet_half_max_age', value: '11' },
    ])
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settings')
}
