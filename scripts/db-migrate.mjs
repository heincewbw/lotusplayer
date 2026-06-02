/**
 * Pre-flight DB migration script.
 * Runs before `next start`. Handles the one-time migration of
 * ambil/sisa columns → pl column, then syncs schema with prisma db push.
 *
 * Fully idempotent — safe to run multiple times.
 * Non-fatal — logs errors but never prevents the app from starting.
 */
import mysql from "mysql2/promise"
import { execSync } from "child_process"

async function migrate() {
  const dbUrl = new URL(process.env.DATABASE_URL)

  const connection = await mysql.createConnection({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    connectTimeout: 10000,
  })

  try {
    // Check which legacy columns still exist
    const [colRows] = await connection.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'SessionEntry'
         AND COLUMN_NAME IN ('ambil', 'sisa', 'pl')`
    )
    const existingCols = colRows.map((r) => r.COLUMN_NAME)
    const hasAmbil = existingCols.includes("ambil")
    const hasPl = existingCols.includes("pl")

    if (hasAmbil) {
      console.log("⚙  Migrating SessionEntry: ambil/sisa → pl ...")

      if (!hasPl) {
        await connection.execute(
          `ALTER TABLE SessionEntry ADD COLUMN pl INT NOT NULL DEFAULT 0`
        )
        console.log("  + Added pl column")
      }

      await connection.execute(
        `UPDATE SessionEntry SET pl = sisa - ambil`
      )
      console.log("  + Data migrated (pl = sisa - ambil)")
      console.log("✓  Data migration complete")
    } else {
      console.log("✓  DB schema already up-to-date, skipping data migration")
    }
  } finally {
    await connection.end()
  }

  // Sync schema to DB (drops old columns, creates missing tables, etc.)
  console.log("⚙  Syncing Prisma schema ...")
  execSync("node_modules/.bin/prisma db push --accept-data-loss --skip-generate", {
    stdio: "inherit",
  })
  console.log("✓  Schema sync complete")
}

try {
  await migrate()
} catch (err) {
  console.error("⚠  db-migrate error (app will still start):", err.message)
}

process.exit(0)
