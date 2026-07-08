import { FastifyInstance } from 'fastify'

import { listPresentes } from '../controllers/presentes/list.js'
import { reservarPresente } from '../controllers/presentes/reservar.js'
import { authenticateAdmin } from '../controllers/admin/authenticate.js'
import { getByGroupSlug } from '../controllers/convidados/get-by-group-slug.js'
import { submitRsvp } from '../controllers/convidados/rsvp.js'

export async function publicRoutes(app: FastifyInstance) {
  app.post('/admin/login', authenticateAdmin)

  app.get('/presentes', listPresentes)
  app.post('/presentes/:id/reservar', reservarPresente)

  app.get('/convidados/:group_slug', getByGroupSlug)
  app.post('/rsvp', submitRsvp)
}
