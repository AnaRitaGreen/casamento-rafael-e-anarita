import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

export async function deleteGroup(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const group = await knex('groups').where({ id }).first()
  if (!group) {
    return reply.status(404).send({ message: 'Grupo não encontrado.' })
  }

  // Verifica se há convidados vinculados
  const guestsCount = await knex('guests').where({ group_id: id }).count('id as count').first()
  if (Number(guestsCount?.count) > 0) {
    return reply.status(400).send({ message: 'Não é possível remover um grupo que possui convidados.' })
  }

  await knex('groups').where({ id }).delete()

  return reply.status(204).send()
}
