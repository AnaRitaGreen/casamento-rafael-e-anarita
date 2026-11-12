import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// GET /api/admin/guests — lista todos os convidados com o nome do grupo e mesa
export async function listGuests(_: FastifyRequest, reply: FastifyReply) {
  const guests = await knex('guests as g')
    .join('groups as gr', 'gr.id', 'g.group_id')
    .leftJoin('tables as t', 't.id', 'g.table_id')
    .select(
      'g.id',
      'g.group_id',
      'gr.name as group_name',
      'gr.slug as group_slug',
      'g.table_id',
      't.table_number',
      'g.name',
      'g.is_child',
      'g.buffet_status',
      'g.rsvp_status',
      'g.rsvp_responded_at',
      'g.checked_in',
      'g.checked_in_at',
    )
    .orderBy(['gr.name', 'g.name'])

  return reply.send({ guests })
}
