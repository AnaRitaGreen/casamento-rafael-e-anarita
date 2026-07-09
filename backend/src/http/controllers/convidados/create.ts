import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '@/database'

// POST /api/admin/guests
export async function createGuest(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name:        z.string().min(1),
    group_id:    z.string().uuid().optional(),
    // Se não informar group_id, pode criar um grupo novo
    group_name:  z.string().min(1).optional(),
    group_slug:  z.string().min(1).optional(),
    is_child:    z.boolean().default(false),
  })

  const { name, group_id, group_name, group_slug, is_child } = schema.parse(request.body)

  let finalGroupId = group_id ?? null

  // Cria novo grupo se necessário
  if (!finalGroupId && group_name) {
    const slug = group_slug ?? group_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const [group] = await knex('groups')
      .insert({ id: randomUUID(), name: group_name, slug })
      .returning('id')
    finalGroupId = group.id
  }

  if (!finalGroupId) {
    return reply.status(400).send({ message: 'Informe group_id ou group_name para criar um novo grupo.' })
  }

  const [guest] = await knex('guests')
    .insert({ id: randomUUID(), group_id: finalGroupId, name, is_child })
    .returning('*')

  return reply.status(201).send({ guest })
}
