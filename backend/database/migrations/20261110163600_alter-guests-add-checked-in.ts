import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasCheckedIn = await knex.schema.hasColumn('guests', 'checked_in')
  if (!hasCheckedIn) {
    await knex.schema.alterTable('guests', (table) => {
      table.boolean('checked_in').notNullable().defaultTo(false)
    })
  }

  const hasCheckedInAt = await knex.schema.hasColumn('guests', 'checked_in_at')
  if (!hasCheckedInAt) {
    await knex.schema.alterTable('guests', (table) => {
      table.timestamp('checked_in_at').nullable().defaultTo(null)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasCheckedInAt = await knex.schema.hasColumn('guests', 'checked_in_at')
  if (hasCheckedInAt) {
    await knex.schema.alterTable('guests', (table) => {
      table.dropColumn('checked_in_at')
    })
  }

  const hasCheckedIn = await knex.schema.hasColumn('guests', 'checked_in')
  if (hasCheckedIn) {
    await knex.schema.alterTable('guests', (table) => {
      table.dropColumn('checked_in')
    })
  }
}
