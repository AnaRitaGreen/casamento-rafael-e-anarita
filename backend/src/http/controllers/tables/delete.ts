import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'

export async function deleteTable(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    id: z.string().uuid()
  })

  const { id } = schema.parse(request.params)

  // Because of foreign key with SET NULL (if configured) or just clear it explicitly
  await knex('guests').where({ table_id: id }).update({ table_id: null })
  
  const deleted = await knex('tables').where({ id }).delete()

  if (!deleted) {
    return reply.status(404).send({ message: 'Mesa não encontrada' })
  }

  return reply.status(204).send()
}
