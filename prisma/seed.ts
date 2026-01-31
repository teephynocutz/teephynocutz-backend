import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient().$extends(
    withAccelerate()
  )


async function main() {
  await prisma.service.upsert({
    where: { name: "Airport Transfers" },
    update: {},
    create: {
      name: "Airport Transfers",
      description: "Reliable airport pickup and drop-off",
    },
  })

  console.log("✅ Services seeded")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
