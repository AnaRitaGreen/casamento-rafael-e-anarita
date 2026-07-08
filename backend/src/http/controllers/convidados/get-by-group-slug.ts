import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

// GET /api/convidados/:group_slug — rota pública usada pelo formulário RSVP
export async function getByGroupSlug(request: FastifyRequest, reply: FastifyReply) {
  const { group_slug } = z.object({ group_slug: z.string() }).parse(request.params)

  const group = await knex('groups').where({ slug: group_slug }).first()

  if (!group) {
    return reply.status(404).send({ message: 'Grupo não encontrado.' })
  }

  const guests = await knex('guests')
    .where({ group_id: group.id })
    .select('id', 'name', 'is_child', 'rsvp_status', 'rsvp_responded_at', 'restriction')
    .orderBy('name')

  return reply.send({
    group: { id: group.id, name: group.name, slug: group.slug },
    guests,
  })
}