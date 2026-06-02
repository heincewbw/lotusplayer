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
  const gameSession = await prisma.session.findUnique({
    where: { id: parseInt(id) },
    include: {
      entries: {
        include: { player: true },
        orderBy: { rowNumber: "asc" },
      },
    },
  })

  if (!gameSession) {
    return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(gameSession)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.session.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { date, notes, entries } = body

  if (!date) return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 })
  if (!Array.isArray(entries) || entries.length < 2) {
    return NextResponse.json({ error: "Minimal 2 player" }, { status: 400 })
  }

  const balance = entries.reduce(
    (sum: number, e: { pl: number }) => sum + e.pl,
    0
  )
  if (balance !== 0) {
    return NextResponse.json(
      { error: `Balance harus 0, sekarang: ${balance > 0 ? "+" : ""}${balance}` },
      { status: 400 }
    )
  }

  const sessionId = parseInt(id)
  await prisma.$transaction(async (tx) => {
    await tx.sessionEntry.deleteMany({ where: { sessionId } })
    await tx.session.update({
      where: { id: sessionId },
      data: { date: new Date(date), notes: notes || null },
    })
    await tx.sessionEntry.createMany({
      data: entries.map((e: { playerId: number; rowNumber: number; pl: number }) => ({
        sessionId,
        playerId: e.playerId,
        rowNumber: e.rowNumber,
        pl: e.pl,
      })),
    })
  })

  return NextResponse.json({ ok: true })
}
