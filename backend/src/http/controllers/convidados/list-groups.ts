import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '@/database'

// GET /api/admin/groups — lista grupos para popular selects no frontend
export async function listGroups(_: FastifyRequest, reply: FastifyReply) {
  const groupsData = await knex('groups')
    .select(
      'groups.id',
      'groups.name',
      'groups.slug',
      knex.raw('COUNT(guests.id) as total_guests'),
      knex.raw(`SUM(CASE WHEN guests.rsvp_status = 'attending' THEN 1 ELSE 0 END) as attending_guests`),
      knex.raw(`SUM(CASE WHEN guests.rsvp_status = 'declined' THEN 1 ELSE 0 END) as declined_guests`)
    )
    .leftJoin('guests', 'groups.id', 'guests.group_id')
    .groupBy('groups.id', 'groups.name', 'groups.slug')
    .orderBy('groups.name')

  const groups = groupsData.map(group => ({
    id: group.id,
    name: group.name,
    slug: group.slug,
    total_guests: Number(group.total_guests || 0),
    attending_guests: Number(group.attending_guests || 0),
    declined_guests: Number(group.declined_guests || 0),
  }))

  return reply.send({ groups })
}
