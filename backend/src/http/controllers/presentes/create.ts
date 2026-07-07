import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '@/database'

export async function createPresente(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    value: z.number().nonnegative().default(0),
  })

  const body = schema.parse(request.body)

  const [presente] = await knex('gifts')
    .insert({ id: randomUUID(), ...body, link: undefined })
    .returning('*')

  return reply.status(201).send({ presente })
}
