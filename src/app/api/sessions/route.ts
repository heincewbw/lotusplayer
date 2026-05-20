import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { date, notes, entries } = body

  if (!date) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 })
  }

  if (!Array.isArray(entries) || entries.length < 2) {
    return NextResponse.json({ error: "Minimal 2 player" }, { status: 400 })
  }

  // Server-side balance validation
  const balance = entries.reduce(
    (sum: number, e: { ambil: number; sisa: number }) => sum + (e.sisa - e.ambil),
    0
  )
  if (balance !== 0) {
    return NextResponse.json(
      { error: `Balance harus 0, sekarang: ${balance > 0 ? "+" : ""}${balance}` },
      { status: 400 }
    )
  }

  const gameSession = await prisma.session.create({
    data: {
      date: new Date(date),
      notes: notes ?? null,
      createdBy: session.user!.id!,
      entries: {
        create: entries.map((e: { playerId: number; rowNumber: number; ambil: number; sisa: number }) => ({
          playerId: e.playerId,
          rowNumber: e.rowNumber,
          ambil: e.ambil,
          sisa: e.sisa,
        })),
      },
    },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  return NextResponse.json(gameSession, { status: 201 })
}
