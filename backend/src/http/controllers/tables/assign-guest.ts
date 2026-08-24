import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'

export async function assignGuestToTable(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid() // guest id
  })
  
  const bodySchema = z.object({
    table_id: z.string().uuid().nullable()
  })

  const { id } = paramsSchema.parse(request.params)
  const { table_id } = bodySchema.parse(request.body)

  // Validate table exists and is not over capacity
  if (table_id) {
    const table = await knex('tables').where({ id: table_id }).first()
    if (!table) {
      return reply.status(404).send({ message: 'Mesa não encontrada' })
    }

    const currentGuests = await knex('guests').where({ table_id }).count('id as count').first()
    if (Number(currentGuests?.count) >= table.capacity) {
      // Check if we are just moving the guest from same table, if not, it's full
      const guest = await knex('guests').where({ id }).first()
      if (guest && guest.table_id !== table_id) {
         return reply.status(400).send({ message: 'A mesa já atingiu a capacidade máxima' })
      }
    }
  }

  const updated = await knex('guests')
    .where({ id })
    .update({ table_id })

  if (!updated) {
    return reply.status(404).send({ message: 'Convidado não encontrado' })
  }

  return reply.send({ message: 'Convidado reposicionado' })
}
