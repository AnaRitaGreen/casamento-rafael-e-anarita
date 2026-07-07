import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// GET /api/admin/groups — lista grupos para popular selects no frontend
export async function listGroups(_: FastifyRequest, reply: FastifyReply) {
  const groups = await knex('groups')
    .select('id', 'name', 'slug')
    .orderBy('name')

  return reply.send({ groups })
}
