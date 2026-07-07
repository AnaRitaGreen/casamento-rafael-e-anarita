import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

// DELETE /api/admin/guests/:id
export async function deleteGuest(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const deleted = await knex('guests').where({ id }).delete()

  if (!deleted) {
    return reply.status(404).send({ message: 'Convidado não encontrado.' })
  }

  return reply.status(204).send()
}
