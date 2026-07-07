import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

export async function updatePresente(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const schema = z.object({
    title:       z.string().min(1).optional(),
    description: z.string().optional(),
    link:        z.string().url().optional().or(z.literal('')),
    image:       z.string().optional(),
    value:       z.number().nonnegative().optional(),
  })

  const body = schema.parse(request.body)

  const [gift] = await knex('gifts')
    .where({ id })
    .update({ ...body, updated_at: new Date() })
    .returning('*')

  if (!gift) {
    return reply.status(404).send({ message: 'Presente não encontrado.' })
  }

  return reply.send({ gift })
}
