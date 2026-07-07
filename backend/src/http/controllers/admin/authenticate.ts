import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'
import { randomUUID } from 'crypto'

import { knex } from '@/database'
import { generateTokensJWT } from '@/utils/generate-tokens-jwt'

export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateAdminBodySchema = z
    .object({
      username: z.string().nonempty(),
      password: z.string().min(6),
    })

  const { username, password } = authenticateAdminBodySchema.parse(request.body)

  const admin = await knex('admins').where({ username }).first()

  if (!admin) {
    return reply.status(400).send({
      message: 'As credenciais informadas estão inválidas',
    })
  }

  const passwordMatches = await bcryptjs.compare(password, admin.password_hash)

  if (!passwordMatches) {
    return reply.status(400).send({
      message: 'As credenciais informadas estão inválidas',
    })
  }

  const { access, refresh } = await generateTokensJWT(admin, reply)

  await knex('admin_refresh_tokens').where({ admin_id: admin.id }).delete()

  await knex('admin_refresh_tokens').insert({
    id: randomUUID(),
    admin_id: admin.id,
    token: refresh,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return reply.send({
    access,
    refresh,
    admin: {
      ...admin,
      password_hash: undefined,
    },
  })
}