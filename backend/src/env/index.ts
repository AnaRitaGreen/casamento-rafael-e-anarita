import { config } from 'dotenv'

import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
}
if (process.env.NODE_ENV === 'production') {
  config({ path: '.env.prod' })
} else {
  config()
}

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  ALLOWED_ORIGIN: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
})

const { success, data, error } = envSchema.safeParse(process.env)

if (!success) {
  const message = 'Variáveis de ambiente inválidas'
  console.error(message, error.format())
  throw new Error(message)
}

export const env = data