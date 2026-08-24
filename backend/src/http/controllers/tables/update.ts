import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'

export async function updateTable(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid()
  })
  
  const bodySchema = z.object({
    capacity: z.number().min(1)
  })

  const { id } = paramsSchema.parse(request.params)
  const { capacity } = bodySchema.parse(request.body)

  const updated = await knex('tables')
    .where({ id })
    .update({ capacity })

  if (!updated) {
    return reply.status(404).send({ message: 'Mesa não encontrada' })
  }

  return reply.send({ message: 'Capacidade atualizada' })
}
