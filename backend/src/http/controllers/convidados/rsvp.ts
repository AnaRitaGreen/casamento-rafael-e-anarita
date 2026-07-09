import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '@/database'

// rsvp_status: 'pending' | 'attending' | 'declined'

// POST /api/rsvp — confirmação de presença pública
export async function submitRsvp(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    group_id:    z.string().uuid(),
    declined:    z.boolean().default(false),
    confirmed:   z.array(z.string().uuid()).default([]),
    message:     z.string().optional(),
  })

  const { group_id, declined, confirmed, message } = schema.parse(request.body)

  const now = new Date()

  if (declined || confirmed.length === 0) {
    // Grupo inteiro recusou
    await knex('guests')
      .where({ group_id })
      .update({ rsvp_status: 'declined', rsvp_responded_at: now })
  } else {
    // Todos recusados por padrão…
    await knex('guests')
      .where({ group_id })
      .update({ rsvp_status: 'declined', rsvp_responded_at: now })

    // …exceto os selecionados
    for (const guestId of confirmed) {
      await knex('guests')
        .where({ id: guestId, group_id })
        .update({ rsvp_status: 'attending', rsvp_responded_at: now })
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
