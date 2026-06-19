/**
 * Pre-flight DB migration script.
 * Runs `prisma migrate deploy` before `next start` to apply pending migrations.
 * Safe for production — never drops data.
 * Non-fatal — logs errors but never prevents the app from starting.
 */
import { execSync } from "child_process"

// Safety net — exit within 60s no matter what
setTimeout(() => {
  console.error("⚠  db-migrate: safety timeout, forcing exit")
  process.exit(0)
}, 60_000).unref()

try {
  console.log("⚙  Applying pending migrations ...")
  execSync("node_modules/.bin/prisma migrate deploy", {
    stdio: ["ignore", "inherit", "inherit"],
    timeout: 50_000,
  })
  console.log("✓  Migrations applied")
} catch (err) {
  console.error("⚠  db-migrate error (app will still start):", err.message)
}

process.exit(0)
