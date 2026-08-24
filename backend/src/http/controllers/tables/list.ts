import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '@/database'

export async function listTables(_: FastifyRequest, reply: FastifyReply) {
  // Get all tables ordered by number
  const tables = await knex('tables').orderBy('table_number')

  // Get all attending guests and their group names
  const guests = await knex('guests as g')
    .join('groups as gr', 'gr.id', 'g.group_id')
    .select(
      'g.id',
      'g.name',
      'g.table_id',
      'g.is_child',
      'g.rsvp_status',
      'gr.name as group_name'
    )
    .where('g.rsvp_status', 'attending')
    .orderBy(['gr.name', 'g.name'])

  // Group guests by table_id
  const unseatedGuests = guests.filter(g => !g.table_id)
  
  const tablesWithGuests = tables.map(t => {
    return {
      ...t,
      guests: guests.filter(g => g.table_id === t.id)
    }
  })

  return reply.send({
    tables: tablesWithGuests,
    unseated_guests: unseatedGuests
  })
}
