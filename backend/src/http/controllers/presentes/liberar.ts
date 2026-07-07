import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

// Admin: libera a reserva de um presente
export async function liberarReserva(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const updated = await knex('gifts')
    .where({ id, reserved: true })
    .update({ reserved: false, reserved_by: undefined, reserved_at: undefined, updated_at: new Date() })

  if (!updated) {
    return reply.status(404).send({ message: 'Presente não encontrado ou já está disponível.' })
  }

  return reply.send({ message: 'Reserva liberada com sucesso.' })
}
