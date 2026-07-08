import dotenv from 'dotenv'
dotenv.config()

export default {
  apps: [
    {
      name: 'casamento-rafael-e-anarita-api',
      script: './build/server.js',
      env: {
        NODE_ENV: 'production',
        ...process.env,
      },
    },
  ],
}
