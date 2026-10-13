import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '@/database'

export async function getBuffetSettings(
  _: FastifyRequest,
  reply: FastifyReply,
) {
  const rows = await knex('settings')
    .whereIn('key', ['buffet_free_max_age', 'buffet_half_max_age'])
    .select('key', 'value')

  const settingsMap = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {})

  const freeMaxAge = settingsMap.buffet_free_max_age
    ? Number(settingsMap.buffet_free_max_age)
    : 5
  const halfMaxAge = settingsMap.buffet_half_max_age
    ? Number(settingsMap.buffet_half_max_age)
    : 11

  return reply.send({
    free_max_age: isNaN(freeMaxAge) ? 5 : freeMaxAge,
    half_max_age: isNaN(halfMaxAge) ? 11 : halfMaxAge,
  })
}
