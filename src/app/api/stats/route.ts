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

  const trend = sessions.map((s) => {
    const row: Record<string, string | number> = {
      date: s.date.toISOString().split("T")[0],
    }
    for (const e of s.entries) {
      row[e.player.name] = e.pl
    }
    return row
  })

  return NextResponse.json({ playerTotals, trend })
}
