import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// Lista admin: inclui reserved_by e reserved_at
export async function listPresentesAdmin(_: FastifyRequest, reply: FastifyReply) {
  const gifts = await knex('gifts')
    .select('*')
    .orderBy('title')

  return reply.send({ gifts })
}
