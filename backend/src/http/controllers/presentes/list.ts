import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// Lista pública: não expõe reserved_by
export async function listPresentes(_: FastifyRequest, reply: FastifyReply) {
  const gifts = await knex('gifts')
    .select('id', 'title', 'description', 'link', 'image', 'value', 'reserved')
    .orderBy('title')

  return reply.send({ gifts })
}
