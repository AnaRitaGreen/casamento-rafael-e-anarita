import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

export async function data(request: FastifyRequest, reply: FastifyReply) {
  const admin = await knex('admins').where('id', request.admin.sub).first()

  if (!admin) {
    return reply.status(400).send({
      message: 'Usuário não encontrado',
    })
  }

  return reply.send({
    admin: {
      ...admin,
      password_hash: undefined,
    },
  })
}