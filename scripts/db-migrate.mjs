/**
 * Pre-flight DB migration script.
 * Runs before `next start`. Handles the one-time migration of
 * ambil/sisa columns → pl column, then syncs schema with prisma db push.
 *
 * Safe to run multiple times (idempotent).
 */
import mysql from "mysql2/promise"
import { execSync } from "child_process"

const dbUrl = new URL(process.env.DATABASE_URL)

const connection = await mysql.createConnection({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
})

try {
  // Check if the old `ambil` column still exists
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'SessionEntry'
       AND COLUMN_NAME = 'ambil'`
  )
  const hasAmbil = rows[0].cnt > 0

  if (hasAmbil) {
    console.log("⚙  Migrating SessionEntry: ambil/sisa → pl ...")
    await connection.execute(
      `ALTER TABLE SessionEntry ADD COLUMN pl INT NOT NULL DEFAULT 0`
    )
    await connection.execute(
      `UPDATE SessionEntry SET pl = sisa - ambil`
    )
    // ambil and sisa will be dropped by prisma db push below
    console.log("✓  Data migration complete")
  } else {
    console.log("✓  DB schema already up-to-date, skipping data migration")
  }
} finally {
  await connection.end()
}

// Sync schema to DB (creates tables on fresh DB, drops old columns, etc.)
console.log("⚙  Syncing Prisma schema ...")
execSync("npx prisma db push --accept-data-loss --skip-generate", {
  stdio: "inherit",
})
console.log("✓  Schema sync complete")
