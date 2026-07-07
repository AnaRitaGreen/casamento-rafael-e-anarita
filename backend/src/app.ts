import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import { ZodError } from 'zod'

import { env } from './env'
import { publicRoutes } from './http/routes/public'
import { adminRoutes } from './http/routes/admin'

const app = Fastify({ logger: true })

app.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://www.convite-casamento.digital',
      'https://www.convite-casamento.digital',
      'http://convite-casamento.digital',
      'https://convite-casamento.digital',

      // ambientes de desenvolvimento
      'http://localhost',
      'http://localhost:80',
      'http://localhost:3000',
      'http://localhost:4321',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4321',
      'http://127.0.0.1:5173',
      'http://192.168.0.115',
      'http://192.168.0.115:3000',
      'http://192.168.0.115:4321',
      'http://192.168.0.115:5173',
    ]

    // Em chamadas sem Origin (ex: curl/postman), pode permitir
    if (!origin) {
      cb(null, true)
      return
    }

    if (allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      console.warn('🚫 Origin não permitida pelo CORS:', origin)
      cb(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '30m',
  },
})

app.register(fastifyCookie)

app.get('/health', (req, res) => res.send('ok'))
app.register(publicRoutes, { prefix: '/api' })
app.register(adminRoutes, { prefix: '/api/admin' })

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Corpo da requisição inválido',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    console.log(error)
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({
    message: 'Internal server error',
  })
})

export { app }

// // ── Plugins ─────────────────────────────────────────────────── //
// await app.register(fastifyCors, {
//   origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4321',
//   credentials: true,
// })

// await app.register(fastifyCookie)

// await app.register(fastifyJwt, {
//   secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
//   cookie: { cookieName: 'auth_token', signed: false },
// })

// // ── Auth decorator ───────────────────────────────────────────── //
// app.decorate('authenticate', async (req, reply) => {
//   try {
//     await req.jwtVerify({ onlyCookie: true })
//   } catch {
//     reply.code(401).send({ error: 'não autorizado' })
//   }
// })

// // ── Rotas ────────────────────────────────────────────────────── //
// await app.register(publicRoutes, { prefix: '/api' })
// await app.register(adminRoutes, { prefix: '/api/admin' })

// // ── Start ────────────────────────────────────────────────────── //
// const port = Number(process.env.PORT) || 8080
// await app.listen({ port, host: '0.0.0.0' })
