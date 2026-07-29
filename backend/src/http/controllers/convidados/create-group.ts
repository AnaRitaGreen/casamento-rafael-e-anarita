import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

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

export async function createGroup(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    name: z.string().min(2).max(128),
    slug: z.string().optional(),
  })

  const { name, slug } = schema.parse(request.body)

  const finalSlug = slug?.trim() ? slugify(slug) : slugify(name)

  const existing = await knex('groups').where({ slug: finalSlug }).first()
  if (existing) {
    return reply.status(409).send({ message: 'Já existe um grupo com esse slug.' })
  }

  const [group] = await knex('groups')
    .insert({ id: randomUUID(), name, slug: finalSlug })
    .returning(['id', 'name', 'slug'])

  return reply.status(201).send({ group })
}
