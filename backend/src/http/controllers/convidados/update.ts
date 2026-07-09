import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

// PUT /api/admin/guests/:id
export async function updateGuest(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const schema = z.object({
    name:        z.string().min(1).optional(),
    group_id:    z.string().uuid().optional(),
    is_child:    z.boolean().optional(),
  })

  const body = schema.parse(request.body)

  const [guest] = await knex('guests')
    .where({ id })
    .update({ ...body, updated_at: new Date() })
    .returning('*')

  if (!guest) {
    return reply.status(404).send({ message: 'Convidado não encontrado.' })
  }

  return reply.send({ guest })
}
