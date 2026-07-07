import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt.js'

import { logoutAdmin } from '../controllers/admin/logout.js'
import { refreshAccessToken } from '../controllers/admin/refresh-access-token.js'
import { data } from '../controllers/admin/data.js'

import { listGuests } from '../controllers/convidados/list.js'
import { createGuest } from '../controllers/convidados/create.js'
import { updateGuest } from '../controllers/convidados/update.js'
import { deleteGuest } from '../controllers/convidados/delete.js'
import { listGroups } from '../controllers/convidados/list-groups.js'
import { listMessages } from '../controllers/convidados/list-messages.js'

import { listPresentesAdmin } from '../controllers/presentes/list-admin.js'
import { createPresente } from '../controllers/presentes/create.js'
import { updatePresente } from '../controllers/presentes/update.js'
import { deletePresente } from '../controllers/presentes/delete.js'
import { liberarReserva } from '../controllers/presentes/liberar.js'

export async function adminRoutes(app: FastifyInstance) {
  app.patch('/token/refresh', refreshAccessToken)
  app.get('/me', data)
  app.post('/logout', logoutAdmin)

  // ── Convidados ────────────────────────────────────────────── //
  app.get('/guests',    listGuests)
  app.post('/guests',   createGuest)
  app.put('/guests/:id',    updateGuest)
  app.delete('/guests/:id', deleteGuest)

  // ── Grupos & Mensagens ────────────────────────────────────── //
  app.get('/groups',   listGroups)
  app.get('/messages', listMessages)

  // ── Presentes ─────────────────────────────────────────────── //
  app.get('/presentes',              listPresentesAdmin)
  app.post('/presentes',             createPresente)
  app.put('/presentes/:id',          updatePresente)
  app.delete('/presentes/:id',       deletePresente)
  app.post('/presentes/:id/liberar', liberarReserva)
}