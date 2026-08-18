import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { knex } from '@/database'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function updateGroup(request: FastifyRequest, reply: FastifyReply) {
  const { id } = z.object({ id: z.string().uuid() }).parse(request.params)

  const schema = z.object({
    name: z.string().min(2).max(128).optional(),
    slug: z.string().optional(),
    invite_sent: z.boolean().optional(),
  })

  const body = schema.parse(request.body)

  const group = await knex('groups').where({ id }).first()
  if (!group) {
    return reply.status(404).send({ message: 'Grupo não encontrado.' })
  }

  const updatedName = body.name ?? group.name
  const updatedSlug = body.slug?.trim() ? slugify(body.slug) : slugify(updatedName)
  const updatedInviteSent = body.invite_sent ?? group.invite_sent

  if (updatedSlug !== group.slug) {
    const conflict = await knex('groups').where({ slug: updatedSlug }).whereNot({ id }).first()
    if (conflict) {
      return reply.status(409).send({ message: 'Já existe um grupo com esse slug.' })
    }
  }

  const [updated] = await knex('groups')
    .where({ id })
    .update({ name: updatedName, slug: updatedSlug, invite_sent: updatedInviteSent })
    .returning(['id', 'name', 'slug', 'invite_sent'])

  return reply.send({ group: updated })
}
