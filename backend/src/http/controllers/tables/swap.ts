import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '@/database'

export async function swapTables(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    table1_id: z.string().uuid(),
    table2_id: z.string().uuid()
  })

  const { table1_id, table2_id } = bodySchema.parse(request.body)

  if (table1_id === table2_id) {
    return reply.status(400).send({ message: 'As mesas selecionadas devem ser diferentes' })
  }

  await knex.transaction(async (trx) => {
    const table1 = await trx('tables').where({ id: table1_id }).first()
    const table2 = await trx('tables').where({ id: table2_id }).first()

    if (!table1 || !table2) {
      return reply.status(404).send({ message: 'Uma ou ambas as mesas não foram encontradas' })
    }

    const guests1 = await trx('guests').where({ table_id: table1_id }).select('id')
    const guests2 = await trx('guests').where({ table_id: table2_id }).select('id')

    if (guests1.length > table2.capacity) {
      throw new Error(`A mesa ${table2.table_number} não tem capacidade para os convidados da mesa ${table1.table_number}`)
    }

    if (guests2.length > table1.capacity) {
      throw new Error(`A mesa ${table1.table_number} não tem capacidade para os convidados da mesa ${table2.table_number}`)
    }

    // Update to null first to avoid any unique constraint issues if they existed, though simple update is fine
    // Or just update directly as we fetched the IDs already
    if (guests1.length > 0) {
      await trx('guests').whereIn('id', guests1.map(g => g.id)).update({ table_id: table2_id })
    }

    if (guests2.length > 0) {
      await trx('guests').whereIn('id', guests2.map(g => g.id)).update({ table_id: table1_id })
    }
  }).catch((err) => {
    return reply.status(400).send({ message: err.message || 'Erro ao trocar mesas' })
  })

  return reply.send({ message: 'Mesas trocadas com sucesso' })
}
