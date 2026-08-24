import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'
import { randomUUID } from 'crypto'

export async function generateTables(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    count: z.number().min(1),
    capacity: z.number().min(1)
  })

  const { count, capacity } = schema.parse(request.body)

  const currentMax = await knex('tables').max('table_number as max').first()
  let nextNumber = currentMax?.max ? Number(currentMax.max) + 1 : 1

  const tablesToInsert = []
  for (let i = 0; i < count; i++) {
    tablesToInsert.push({
      id: randomUUID(),
      table_number: nextNumber++,
      capacity
    })
  }

  await knex('tables').insert(tablesToInsert)

  return reply.status(201).send({ message: 'Mesas geradas com sucesso', count })
}
