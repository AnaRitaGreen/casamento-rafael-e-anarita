import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'

export async function updateBuffetSettings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const schema = z
    .object({
      free_max_age: z.coerce
        .number({ invalid_type_error: 'A idade deve ser um número' })
        .int({ message: 'A idade deve ser um número inteiro' })
        .min(0, 'A idade de gratuidade não pode ser negativa'),
      half_max_age: z.coerce
        .number({ invalid_type_error: 'A idade deve ser um número' })
        .int({ message: 'A idade deve ser um número inteiro' })
        .min(
          1,
          'A idade máxima para meia entrada deve ser de pelo menos 1 ano',
        ),
    })
    .refine((data) => data.half_max_age > data.free_max_age, {
      message:
        'A idade máxima para pagar meia deve ser maior que a idade limite de gratuidade',
      path: ['half_max_age'],
    })

  const { free_max_age, half_max_age } = schema.parse(request.body)

  await knex.transaction(async (trx) => {
    await trx('settings')
      .insert({
        key: 'buffet_free_max_age',
        value: String(free_max_age),
        updated_at: new Date(),
      })
      .onConflict('key')
      .merge({
        value: String(free_max_age),
        updated_at: new Date(),
      })

    await trx('settings')
      .insert({
        key: 'buffet_half_max_age',
        value: String(half_max_age),
        updated_at: new Date(),
      })
      .onConflict('key')
      .merge({
        value: String(half_max_age),
        updated_at: new Date(),
      })
  })

  return reply.send({
    message: 'Configurações do buffet atualizadas com sucesso',
    free_max_age,
    half_max_age,
  })
}
