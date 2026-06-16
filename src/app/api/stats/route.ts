import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const dateFilter: { gte?: Date; lte?: Date } = {}
  if (start) dateFilter.gte = new Date(start)
  if (end) {
    const d = new Date(end)
    d.setHours(23, 59, 59, 999)
    dateFilter.lte = d
  }

  const sessions = await prisma.session.findMany({
    where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
    orderBy: { date: "asc" },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  // Compute totals from filtered sessions
  const totalsMap = new Map<number, { name: string; total: number; wins: number; losses: number; played: number }>()
  for (const s of sessions) {
    for (const e of s.entries) {
      const pl = e.pl
      const existing = totalsMap.get(e.playerId) ?? {
        name: e.player.name,
        total: 0,
        wins: 0,
        losses: 0,
        played: 0,
      }
      existing.total += pl
      existing.played++
      if (pl > 0) existing.wins++
      else if (pl < 0) existing.losses++
      totalsMap.set(e.playerId, existing)
    }
  }

  const playerTotals = Array.from(totalsMap.values()).sort((a, b) => b.total - a.total)

  // Build cumulative P/L trend
  const cumulativeMap = new Map<string, number>()
  const trend = sessions.map((s) => {
    // Update running totals for players in this session
    for (const e of s.entries) {
      cumulativeMap.set(e.player.name, (cumulativeMap.get(e.player.name) ?? 0) + e.pl)
    }
    const row: Record<string, string | number> = {
      date: s.date.toISOString().split("T")[0],
    }
    // Only include players who have played at least once so far
    for (const [name, total] of cumulativeMap.entries()) {
      row[name] = total
    }
    return row
  })

  return NextResponse.json({ playerTotals, trend })
}
