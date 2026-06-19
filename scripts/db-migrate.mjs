/**
 * Pre-flight DB migration script.
 * Runs `prisma db push` before `next start` to keep the schema in sync.
 * Non-fatal — logs errors but never prevents the app from starting.
 */
import { execSync } from "child_process"

// Safety net — exit within 60s no matter what
setTimeout(() => {
  console.error("⚠  db-migrate: safety timeout, forcing exit")
  process.exit(0)
}, 60_000).unref()

try {
  console.log("⚙  Syncing Prisma schema ...")
  execSync("node_modules/.bin/prisma db push --accept-data-loss --skip-generate", {
    stdio: ["ignore", "inherit", "inherit"],
    timeout: 50_000,
  })
  console.log("✓  Schema sync complete")
} catch (err) {
  console.error("⚠  db-migrate error (app will still start):", err.message)
}

process.exit(0)
