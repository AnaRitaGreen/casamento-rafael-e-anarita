import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../middlewares/verify-jwt.js'

import { logoutAdmin } from '../controllers/admin/logout.js'
import { refreshAccessToken } from '../controllers/admin/refresh-access-token.js'
import { data } from '../controllers/admin/data.js'
import { exportGuestsPDF } from '../controllers/admin/export-pdf.js'

import { listGuests } from '../controllers/convidados/list.js'
import { createGuest } from '../controllers/convidados/create.js'
import { updateGuest } from '../controllers/convidados/update.js'
import { deleteGuest } from '../controllers/convidados/delete.js'
import { listGroups } from '../controllers/convidados/list-groups.js'
import { createGroup } from '../controllers/convidados/create-group.js'
import { updateGroup } from '../controllers/convidados/update-group.js'
import { deleteGroup } from '../controllers/convidados/delete-group.js'
import { listMessages } from '../controllers/convidados/list-messages.js'

import { listPresentesAdmin } from '../controllers/presentes/list-admin.js'
import { createPresente } from '../controllers/presentes/create.js'
import { updatePresente } from '../controllers/presentes/update.js'
import { deletePresente } from '../controllers/presentes/delete.js'
import { liberarReserva } from '../controllers/presentes/liberar.js'

import { listTables } from '../controllers/tables/list.js'
import { generateTables } from '../controllers/tables/generate.js'
import { updateTable } from '../controllers/tables/update.js'
import { deleteTable } from '../controllers/tables/delete.js'
import { assignGuestToTable } from '../controllers/tables/assign-guest.js'
import { swapTables } from '../controllers/tables/swap.js'
export async function adminRoutes(app: FastifyInstance) {
  app.patch('/token/refresh', refreshAccessToken)
  app.get('/me', data)
  app.post('/logout', logoutAdmin)
  app.get('/export/pdf', exportGuestsPDF)

  // ── Convidados ────────────────────────────────────────────── //
  app.get('/guests',    listGuests)
  app.post('/guests',   createGuest)
  app.put('/guests/:id',    updateGuest)
  app.delete('/guests/:id', deleteGuest)

  // ── Grupos & Mensagens ────────────────────────────────────── //
  app.get('/groups',          listGroups)
  app.post('/groups',         createGroup)
  app.put('/groups/:id',      updateGroup)
  app.delete('/groups/:id',   deleteGroup)
  app.get('/messages', listMessages)

  // ── Presentes ─────────────────────────────────────────────── //
  app.get('/presentes',              listPresentesAdmin)
  app.post('/presentes',             createPresente)
  app.put('/presentes/:id',          updatePresente)
  app.delete('/presentes/:id',       deletePresente)
  app.post('/presentes/:id/liberar', liberarReserva)

  // ── Mesas ─────────────────────────────────────────────────── //
  app.get('/tables',                 listTables)
  app.post('/tables/generate',       generateTables)
  app.post('/tables/swap',           swapTables)
  app.put('/tables/:id/capacity',    updateTable)
  app.delete('/tables/:id',          deleteTable)
  app.put('/guests/:id/table',       assignGuestToTable)
}