import type { Knex } from 'knex'

// rsvp_status values: 'pending' | 'attending' | 'declined'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    // Remove colunas antigas
    table.dropColumn('confirmed')
    table.dropColumn('confirmed_at')

    // Adiciona novas colunas
    table.enum('rsvp_status', ['pending', 'attending', 'declined']).notNullable().defaultTo('pending')
    table.timestamp('rsvp_responded_at').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    table.dropColumn('rsvp_status')
    table.dropColumn('rsvp_responded_at')

    // Restaura colunas originais
    table.boolean('confirmed').notNullable().defaultTo(false)
    table.date('confirmed_at').nullable()
  })
}
