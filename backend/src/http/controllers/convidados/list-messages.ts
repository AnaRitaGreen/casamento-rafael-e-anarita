import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// GET /api/admin/messages — mensagens deixadas pelos convidados no RSVP
export async function listMessages(_: FastifyRequest, reply: FastifyReply) {
  const messages = await knex('group_messages as m')
    .join('groups as g', 'g.id', 'm.group_id')
    .select(
      'm.id',
      'm.group_id',
      'g.name as group_name',
      'm.message',
      'm.created_at',
    )
    .orderBy('m.created_at', 'desc')

  return reply.send({ messages })
}
