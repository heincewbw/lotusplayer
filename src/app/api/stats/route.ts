import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // All-time totals per player
  const entries = await prisma.sessionEntry.findMany({
    include: { player: true },
  })

  const totalsMap = new Map<number, { name: string; total: number; wins: number; losses: number }>()
  for (const e of entries) {
    const pl = e.sisa - e.ambil
    const existing = totalsMap.get(e.playerId) ?? {
      name: e.player.name,
      total: 0,
      wins: 0,
      losses: 0,
    }
    existing.total += pl
    if (pl > 0) existing.wins++
    else if (pl < 0) existing.losses++
    totalsMap.set(e.playerId, existing)
  }

  const playerTotals = Array.from(totalsMap.values()).sort((a, b) => b.total - a.total)

  // Session trend data
  const sessions = await prisma.session.findMany({
    orderBy: { date: "asc" },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  const trend = sessions.map((s) => {
    const row: Record<string, string | number> = {
      date: s.date.toISOString().split("T")[0],
    }
    for (const e of s.entries) {
      row[e.player.name] = e.sisa - e.ambil
    }
    return row
  })

  return NextResponse.json({ playerTotals, trend })
}
