import '@fastify/jwt'
declare module '@fastify/jwt' {
  export interface FastifyJWT {
    admin: {
      sub: string
    }
  }
}