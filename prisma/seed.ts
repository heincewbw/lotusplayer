import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import bcrypt from "bcryptjs"

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  connectionLimit: 5,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash("admin123", 12)
  const user = await prisma.user.upsert({
    where: { email: "admin@lotus.com" },
    update: {},
    create: {
      email: "admin@lotus.com",
      password: hash,
    },
  })
  console.log("✓ Admin user:", user.email, "/ password: admin123")

  // Sample players
  const playerNames = ["Jon", "Ridwan", "Willy", "Hendra"]
  for (const name of playerNames) {
    await prisma.player.upsert({
      where: { id: playerNames.indexOf(name) + 1 },
      update: { name },
      create: { name },
    })
  }
  console.log("✓ Sample players created:", playerNames.join(", "))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
