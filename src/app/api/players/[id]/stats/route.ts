import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const playerId = parseInt(id)

  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!player) return NextResponse.json({ error: "Player tidak ditemukan" }, { status: 404 })

  const entries = await prisma.sessionEntry.findMany({
    where: { playerId },
    include: { session: true },
    orderBy: { session: { date: "asc" } },
  })

  let total = 0
  let wins = 0
  let losses = 0

  const sessions = entries.map((e) => {
    const pl = e.pl
    total += pl
    if (pl > 0) wins++
    else if (pl < 0) losses++
    return {
      sessionId: e.sessionId,
      date: e.session.date.toISOString().split("T")[0],
      pl,
    }
  })

  return NextResponse.json({
    player: { id: player.id, name: player.name },
    sessions,
    total,
    wins,
    losses,
  })
}
