import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

export async function deletePresente(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const deleted = await knex('gifts').where({ id }).delete()

  if (!deleted) {
    return reply.status(404).send({ message: 'Presente não encontrado.' })
  }

  return reply.status(204).send()
}
