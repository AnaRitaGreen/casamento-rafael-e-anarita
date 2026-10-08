import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import PDFDocument from 'pdfkit'
import { knex } from '@/database'

export async function exportGuestsPDF(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    type: z.enum(['all', 'confirmed', 'tables']).default('all')
  })

  const { type } = querySchema.parse(request.query)

  // Fetch data
  let query = knex('guests')
    .leftJoin('groups', 'guests.group_id', 'groups.id')
    .leftJoin('tables', 'guests.table_id', 'tables.id')
    .select('guests.*', 'groups.name as group_name', 'tables.table_number')
    .orderBy('guests.name', 'asc')

  if (type === 'confirmed' || type === 'tables') {
    query = query.where('guests.rsvp_status', 'attending')
  }

  if (type === 'tables') {
    // Order by table number first, then guest name
    query = query.clearOrder().orderByRaw('tables.table_number ASC NULLS LAST').orderBy('guests.name', 'asc')
  }

  const guests = await query

  const doc = new PDFDocument({ margin: 50 })
  
  reply.header('Content-Type', 'application/pdf')
  reply.header('Content-Disposition', `attachment; filename="convidados_${type}.pdf"`)

  // Title
  let title = 'Lista de Convidados'
  if (type === 'confirmed') title = 'Convidados Confirmados'
  if (type === 'tables') title = 'Convidados por Mesa'

  doc.fontSize(20).text(title, { align: 'center' }).moveDown(2)

  // Generate content
  if (type === 'tables') {
    let currentTable: number | null | undefined = undefined
    for (const guest of guests) {
      if (guest.table_number !== currentTable) {
        currentTable = guest.table_number
        doc.moveDown()
        doc.fontSize(16).fillColor('purple').text(currentTable ? `Mesa ${currentTable}` : 'Sem Mesa')
        doc.moveDown(0.5)
      }
      doc.fontSize(12).fillColor('black').text(`• ${guest.name} (${guest.group_name || 'Sem grupo'})`)
    }
  } else {
    for (const guest of guests) {
      const status = guest.rsvp_status === 'attending' ? '✅ Confirmado' : guest.rsvp_status === 'declined' ? '❌ Recusado' : '⏳ Pendente'
      const tableInfo = guest.table_number ? ` - Mesa ${guest.table_number}` : ''
      doc.fontSize(12).fillColor('black').text(`• ${guest.name} (${guest.group_name || 'Sem grupo'}) - ${status}${tableInfo}`)
    }
  }

  doc.end()

  return reply.send(doc)
}
