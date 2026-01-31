// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    // Used by Prisma Migrate
    url: env('DIRECT_URL'),
  },

  migrations: {
    path: 'prisma/migrations',
  },
})
