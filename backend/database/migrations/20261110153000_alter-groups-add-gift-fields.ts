import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasGaveGift = await knex.schema.hasColumn('groups', 'gave_gift')
  if (!hasGaveGift) {
    await knex.schema.alterTable('groups', (table) => {
      table.boolean('gave_gift').notNullable().defaultTo(false)
    })
  }

  const hasGiftDescription = await knex.schema.hasColumn(
    'groups',
    'gift_description',
  )
  if (!hasGiftDescription) {
    await knex.schema.alterTable('groups', (table) => {
      table.string('gift_description', 255).nullable().defaultTo(null)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasGiftDescription = await knex.schema.hasColumn(
    'groups',
    'gift_description',
  )
  if (hasGiftDescription) {
    await knex.schema.alterTable('groups', (table) => {
      table.dropColumn('gift_description')
    })
  }

  const hasGaveGift = await knex.schema.hasColumn('groups', 'gave_gift')
  if (hasGaveGift) {
    await knex.schema.alterTable('groups', (table) => {
      table.dropColumn('gave_gift')
    })
  }
}
