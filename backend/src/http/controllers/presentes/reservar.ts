import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

// Rota pública: convidado reserva um presente em nome de um guest_id
export async function reservarPresente(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const schema = z.object({
    guest_id: z.string().uuid(),
  })

  const { guest_id } = schema.parse(request.body)

  const updated = await knex('gifts')
    .where({ id, reserved: false })
    .update({ reserved: true, reserved_by: guest_id, reserved_at: new Date() })

  if (!updated) {
    return reply.status(409).send({ message: 'Este presente já foi reservado por outra pessoa.' })
  }

  return reply.send({ message: 'Presente reservado com sucesso.' })
}
