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

  const doc = new PDFDocument({ margin: 36 })

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

    const startX = 36
    const colWidths = [350, 120]
    const rowHeight = 16

    const checkPageEnd = (heightRequired: number) => {
      if (doc.y + heightRequired > doc.page.height - 36) {
        doc.addPage()
        return true
      }
      return false
    }

    for (const guest of guests) {
      if (guest.table_number !== currentTable) {
        currentTable = guest.table_number

        checkPageEnd(80)

        doc.moveDown(1.5)
        doc.fontSize(16).fillColor('purple').font('Helvetica-Bold').text(currentTable ? `Mesa ${currentTable}` : 'Sem Mesa', startX)
        doc.moveDown(0.5)

        // Header
        const startY = doc.y
        doc.rect(startX, startY, colWidths[0] + colWidths[1], rowHeight).fillAndStroke('#f3f4f6', '#d1d5db')
        doc.fillColor('#374151').fontSize(8).font('Helvetica-Bold')
        doc.text('NOME DO CONVIDADO', startX + 10, startY + 8)
        doc.text('ENTROU', startX + colWidths[0] + 10, startY + 8)

        doc.moveTo(startX + colWidths[0], startY).lineTo(startX + colWidths[0], startY + rowHeight).stroke('#d1d5db')

        doc.y = startY + rowHeight
      }

      if (checkPageEnd(rowHeight)) {
        // Redraw header if page breaks inside a table
        const startY = doc.y
        doc.rect(startX, startY, colWidths[0] + colWidths[1], rowHeight).fillAndStroke('#f3f4f6', '#d1d5db')
        doc.fillColor('#374151').fontSize(8).font('Helvetica-Bold')
        doc.text('NOME DO CONVIDADO', startX + 10, startY + 8)
        doc.text('ENTROU', startX + colWidths[0] + 10, startY + 8)
        doc.moveTo(startX + colWidths[0], startY).lineTo(startX + colWidths[0], startY + rowHeight).stroke('#d1d5db')
        doc.y = startY + rowHeight
      }

      const startY = doc.y
      doc.rect(startX, startY, colWidths[0] + colWidths[1], rowHeight).stroke('#d1d5db')
      doc.fillColor('#111827').fontSize(8).font('Helvetica')
      doc.text(guest.name, startX + 10, startY + 7, { width: colWidths[0] - 20, height: 12, ellipsis: true })

      doc.moveTo(startX + colWidths[0], startY).lineTo(startX + colWidths[0], startY + rowHeight).stroke('#d1d5db')

      doc.y = startY + rowHeight
    }
  } else {
    doc.font('Helvetica')
    for (const guest of guests) {
      const status = guest.rsvp_status === 'attending' ? '✅ Confirmado' : guest.rsvp_status === 'declined' ? '❌ Recusado' : '⏳ Pendente'
      const tableInfo = guest.table_number ? ` - Mesa ${guest.table_number}` : ''
      doc.fontSize(12).fillColor('black').text(`• ${guest.name} (${guest.group_name || 'Sem grupo'}) - ${status}${tableInfo}`)
    }
  }

  doc.end()

  return reply.send(doc)
}
