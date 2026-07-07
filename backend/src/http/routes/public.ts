import { FastifyInstance } from 'fastify'

import { listPresentes } from '../controllers/presentes/list.js'
import { reservarPresente } from '../controllers/presentes/reservar.js'
import { authenticateAdmin } from '../controllers/admin/authenticate.js'
import { getByGroupSlug } from '../controllers/convidados/get_by_group_slug.js'
import { submitRsvp } from '../controllers/convidados/rsvp.js'

export async function publicRoutes(app: FastifyInstance) {
  app.get('/presentes', listPresentes)
  app.post('/presentes/:id/reservar', reservarPresente)
  app.get('/convidados/:group_slug', getByGroupSlug)
  app.post('/rsvp', submitRsvp)
  app.post('/admin/login', authenticateAdmin)

  // ── POST /api/rsvp ───────────────────────────────────────────── //
  // app.post('/rsvp', {
  //   schema: {
  //     body: {
  //       type: 'object',
  //       required: ['grupoId'],
  //       properties: {
  //         grupoId: { type: 'integer' },
  //         recusado: { type: 'boolean' },
  //         confirmados: { type: 'array', items: { type: 'integer' } },
  //         restricaoAlimentar: { type: 'string' },
  //         mensagem: { type: 'string' },
  //       },
  //     },
  //   },
  // }, async (req, reply) => {
  //   const { grupoId, recusado, confirmados = [], restricaoAlimentar = '', mensagem } = req.body
  //   const now = new Date()

  //   // Busca nome do grupo para registrar na mensagem
  //   const grupo = await db('grupos').where('id', grupoId).first('nome_grupo')
  //   if (!grupo) return reply.code(404).send({ error: 'grupo não encontrado' })

  //   if (recusado || !confirmados.length) {
  //     // Grupo inteiro recusou
  //     await db('convidados')
  //       .where('grupo_id', grupoId)
  //       .update({ confirmado: false, data_confirmacao: now })
  //   } else {
  //     // Primeiro, marca todos como recusado
  //     await db('convidados')
  //       .where('grupo_id', grupoId)
  //       .update({ confirmado: false, data_confirmacao: now })

  //     // Depois, confirma apenas os selecionados
  //     for (const memberId of confirmados) {
  //       await db('convidados')
  //         .where('id', memberId)
  //         .where('grupo_id', grupoId)
  //         .update({ confirmado: true, data_confirmacao: now, restricao_alimentar: restricaoAlimentar })
  //     }
  //   }

  //   // Salva mensagem (se houver)
  //   if (mensagem?.trim()) {
  //     await db('mensagens').insert({ grupo_id: grupoId, nome: grupo.nome_grupo, mensagem })
  //   }

  //   return { status: 'ok' }
  // })

  // ── POST /api/presentes/:id/reservar ────────────────────────── //
  // app.post('/presentes/:id/reservar', {
  //   schema: {
  //     params: { type: 'object', properties: { id: { type: 'integer' } } },
  //     body: {
  //       type: 'object',
  //       required: ['nome'],
  //       properties: { nome: { type: 'string' } },
  //     },
  //   },
  // }, async (req, reply) => {
  //   const { id } = req.params
  //   const { nome } = req.body

  //   const count = await db('presentes')
  //     .where('id', id)
  //     .where('reservado', false)
  //     .update({ reservado: true, reservado_por: nome, data_reserva: new Date() })

  //   if (!count) return reply.code(409).send({ error: 'este presente já foi reservado por outra pessoa' })

  //   return { status: 'ok' }
  // })
}
