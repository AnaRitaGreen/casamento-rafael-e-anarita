import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'
import { sendTelegramMessage } from '@/utils/telegram'

// Rota pública: convidado reserva um presente em nome de um guest_id
export async function reservarPresente(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const schema = z.object({
    nome: z.string().min(2),
    slug: z.string().optional(),
  })

  const { nome, slug } = schema.parse(request.body)

  const updated = await knex('gifts')
    .where({ id, reserved: false })
    .update({ reserved: true, reserved_by: nome, reserved_by_slug: slug ?? null, reserved_at: new Date() })

  if (!updated) {
    return reply.status(409).send({ message: 'Este presente já foi reservado por outra pessoa.' })
  }

  // Busca o título do presente para a notificação
  const gift = await knex('gifts').where({ id }).first()
  const titulo = gift?.title ?? 'Presente'

  // Notificação no Telegram (fire-and-forget)
  sendTelegramMessage(
    `🎁 <b>Presente reservado!</b>\n\n` +
    `👤 <b>Quem:</b> ${nome}\n` +
    `📦 <b>Presente:</b> ${titulo}` +
    (slug ? `\n🔗 <b>Grupo:</b> ${slug}` : ''),
  )

  return reply.send({ message: 'Presente reservado com sucesso.' })
}
