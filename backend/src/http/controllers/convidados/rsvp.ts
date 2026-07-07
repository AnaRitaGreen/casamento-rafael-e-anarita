import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '@/database'

// POST /api/rsvp — confirmação de presença pública
export async function submitRsvp(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    group_id:    z.string().uuid(),
    declined:    z.boolean().default(false),
    confirmed:   z.array(z.string().uuid()).default([]),
    restriction: z.string().optional().default(''),
    message:     z.string().optional(),
  })

  const { group_id, declined, confirmed, restriction, message } = schema.parse(request.body)

  const now = new Date()

  if (declined || confirmed.length === 0) {
    // Grupo inteiro recusou
    await knex('guests').where({ group_id }).update({ confirmed: false, confirmed_at: now })
  } else {
    // Marca todos como recusado primeiro
    await knex('guests').where({ group_id }).update({ confirmed: false, confirmed_at: now })

    // Confirma apenas os selecionados (com a restrição alimentar)
    for (const guestId of confirmed) {
      await knex('guests')
        .where({ id: guestId, group_id })
        .update({ confirmed: true, confirmed_at: now, restriction })
    }
  }

  // Salva mensagem se houver
  if (message?.trim()) {
    await knex('group_messages').insert({
      id: randomUUID(),
      group_id,
      message: message.trim(),
    })
  }

  return reply.send({ message: 'Confirmação registrada com sucesso.' })
}
